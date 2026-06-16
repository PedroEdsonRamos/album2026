/**
 * Serviço de dados da Copa 2026 — via Highlightly (Edge Function proxy)
 */
import { supabase } from "@/lib/supabase";

const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data, ttlMs) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

async function proxyFetch(endpoint, params = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Não autenticado");

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/worldcup-proxy`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint, params }),
    }
  );

  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Erro no proxy");
  return result;
}

// UTC → Brasília (UTC-3)
export function toBrasilia(utcStr) {
  const d = new Date(utcStr);
  return new Date(d.getTime() + (-3) * 60 * 60 * 1000);
}

export function formatBrasilia(utcStr) {
  const d = toBrasilia(utcStr);
  return {
    date: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }),
    time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    dateObj: d,
    dateKey: d.toISOString().split("T")[0],
  };
}

// Data de hoje em Brasília (apenas YYYY-MM-DD)
export function todayKeyBrasilia() {
  return formatBrasilia(new Date().toISOString()).dateKey;
}

/**
 * Fixtures (matches) da Copa 2026
 * Cache: 5min se ao vivo, 30min se não
 */
export async function getFixtures() {
  const key = "fixtures_all";
  const cached = getCached(key);
  if (cached) return cached;

  const response = await proxyFetch("matches");
  const matches = response.data ?? response.matches ?? response;
  const cachedAt = response._cachedAt;

  if (!Array.isArray(matches)) {
    console.error("Estrutura inesperada de matches:", response);
    return [];
  }

  const enriched = matches.map(m => ({ ...m, _cachedAt: cachedAt }));

  const hasLive = enriched.some(m => {
    const s = (m.state?.description ?? m.status ?? "").toUpperCase();
    return ["IN_PLAY","LIVE","HALFTIME","FIRST_HALF","SECOND_HALF","ET","P"].includes(s);
  });
  setCache(key, enriched, hasLive ? 5 * 60 * 1000 : 30 * 60 * 1000);
  return enriched;
}

/**
 * Standings — retorna { groups, thirdPlaceTable }
 * Highlightly: { groups: [{name, standings}], league }
 * Último grupo "Group Stage" é o agregado dos 3os lugares
 */
export async function getStandings() {
  const key = "standings";
  const cached = getCached(key);
  if (cached) return cached;

  const response = await proxyFetch("standings");
  const allGroups = response.groups ?? [];
  const realGroups = allGroups.filter(g => g.name !== "Group Stage");
  const thirdPlaceTable = allGroups.find(g => g.name === "Group Stage")?.standings ?? [];

  const result = { groups: realGroups, thirdPlaceTable };
  setCache(key, result, 60 * 60 * 1000);
  return result;
}

/**
 * Extrai placar da partida — Highlightly retorna como string "X - Y"
 */
export function extractScore(match) {
  // Tentativa 1: state.score.current como STRING "X - Y"
  const current = match?.state?.score?.current;
  if (typeof current === "string" && current.includes("-")) {
    const [home, away] = current.split("-").map(s => s.trim());
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (!isNaN(h) && !isNaN(a)) {
      return { home: h, away: a };
    }
  }

  // Tentativa 2: state.score.current como array [home, away] (legado)
  if (Array.isArray(current) && current[0] !== undefined && current[1] !== undefined) {
    return { home: current[0], away: current[1] };
  }

  // Tentativa 3: campos top-level (formato API-Football antigo)
  if (match?.homeScore !== undefined && match?.awayScore !== undefined
      && match?.homeScore !== null && match?.awayScore !== null) {
    return { home: match.homeScore, away: match.awayScore };
  }

  return null;
}

/**
 * Status do jogo em pt-BR — mapeia as descrições reais da Highlightly
 */
export function getMatchStatus(match) {
  const desc = (match.state?.description ?? "").toLowerCase();
  const clock = match.state?.clock;

  // Status ao vivo
  if (desc === "first half" || desc === "second half") {
    return { label: clock ? `${clock}'` : "AO VIVO", type: "live" };
  }
  if (desc === "halftime" || desc === "half time") {
    return { label: "Intervalo", type: "live" };
  }
  if (desc.includes("extra") && desc.includes("time")) {
    return { label: clock ? `Prorr. ${clock}'` : "Prorrogação", type: "live" };
  }
  if (desc === "penalties" || desc === "penalty shootout") {
    return { label: "Pênaltis", type: "live" };
  }

  // Encerrado
  if (desc === "finished" || desc === "full time") {
    return { label: "Encerrado", type: "finished" };
  }
  if (desc.includes("after extra time") || desc === "aet") {
    return { label: "Enc. (PE)", type: "finished" };
  }
  if (desc.includes("penalty") && desc.includes("end")) {
    return { label: "Enc. (PEN)", type: "finished" };
  }

  // Outros
  if (desc === "postponed") return { label: "Adiado", type: "postponed" };
  if (desc === "cancelled" || desc === "canceled") return { label: "Cancelado", type: "cancelled" };

  // Default = agendado
  return { label: "Agendado", type: "scheduled" };
}

/**
 * Extrai data do match (lida com múltiplas estruturas possíveis)
 */
export function getMatchDate(match) {
  return match.date ?? match.fixture?.date ?? match.kickoff ?? null;
}

// ===== NOVOS ENDPOINTS PARA O MODAL =====

/**
 * Escalações (titulares + reservas + formação)
 * Cache: 1h server-side
 */
export async function getLineups(matchId) {
  return proxyFetch("lineups", { matchId });
}

/**
 * Estatísticas da partida (posse, chutes, faltas, escanteios, etc)
 * Cache: 2min ao vivo, ou final fixo
 */
export async function getMatchStatistics(matchId) {
  return proxyFetch("statistics", { matchId });
}

/**
 * Eventos da partida (gols, cartões, substituições, com minuto)
 * Cache: 30s ao vivo
 */
export async function getLiveEvents(matchId) {
  return proxyFetch("live-events", { matchId });
}

/**
 * Histórico de confrontos diretos entre 2 times
 * Cache: 7 dias
 */
export async function getHeadToHead(teamIdOne, teamIdTwo) {
  return proxyFetch("head-2-head", { teamIdOne, teamIdTwo });
}

/**
 * Últimos 5 jogos de uma seleção (forma recente)
 * Cache: 24h
 */
export async function getLastFiveGames(teamId) {
  return proxyFetch("last-five-games", { teamId });
}

/**
 * Vídeos de melhores momentos
 * Cache: 10min
 */
export async function getHighlights(matchId) {
  return proxyFetch("highlights", { matchId });
}
