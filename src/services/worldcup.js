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
 * Extrai placar de forma robusta — lida com múltiplas estruturas da Highlightly
 */
export function extractScore(match) {
  const current = match?.state?.score?.current;
  if (Array.isArray(current) && current[0] !== undefined && current[1] !== undefined) {
    return { home: current[0], away: current[1] };
  }

  const stateScore = match?.state?.score;
  if (stateScore && stateScore.home !== undefined && stateScore.away !== undefined
      && stateScore.home !== null && stateScore.away !== null) {
    return { home: stateScore.home, away: stateScore.away };
  }

  if (match?.homeScore !== undefined && match?.awayScore !== undefined
      && match?.homeScore !== null && match?.awayScore !== null) {
    return { home: match.homeScore, away: match.awayScore };
  }

  if (match?.goals?.home !== undefined && match?.goals?.away !== undefined
      && match?.goals?.home !== null && match?.goals?.away !== null) {
    return { home: match.goals.home, away: match.goals.away };
  }

  return null;
}

/**
 * Status do jogo em pt-BR
 */
export function getMatchStatus(match) {
  const status = (match.state?.description ?? match.status ?? "SCHEDULED").toUpperCase();
  const minute = match.state?.clock ?? match.minute ?? "";

  if (["IN_PLAY","LIVE","FIRST_HALF","SECOND_HALF"].includes(status)) {
    return { label: minute ? `${minute}'` : "AO VIVO", type: "live" };
  }
  if (status === "HALFTIME" || status === "HT") return { label: "Intervalo", type: "live" };
  if (status === "EXTRA_TIME" || status === "ET") return { label: `Prorr. ${minute}'`, type: "live" };
  if (status === "PENALTIES" || status === "P") return { label: "Pênaltis", type: "live" };
  if (["FINISHED","FT","AET","PEN"].includes(status)) return { label: "Encerrado", type: "finished" };
  if (status === "POSTPONED" || status === "PST") return { label: "Adiado", type: "postponed" };
  if (status === "CANCELLED" || status === "CANC") return { label: "Cancelado", type: "cancelled" };

  // Fallback: detection by keyword for Highlightly descriptions
  const desc = status.toLowerCase();
  const has = (...keys) => keys.some(k => desc.includes(k));
  if (has("finished", "full time", "ended", "after extra", "after penalt")) return { label: "Encerrado", type: "finished" };
  if (has("penalt")) return { label: "Pênaltis", type: "live" };
  if (has("extra")) return { label: minute ? `Prorr. ${minute}'` : "Prorrogação", type: "live" };
  if (has("halftime", "half time", "break", "interval")) return { label: "Intervalo", type: "live" };
  if (has("first half", "second half", "in play", "live", "playing")) {
    return { label: minute ? `${minute}'` : "AO VIVO", type: "live" };
  }
  if (has("postpone")) return { label: "Adiado", type: "postponed" };
  if (has("cancel")) return { label: "Cancelado", type: "cancelled" };

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
