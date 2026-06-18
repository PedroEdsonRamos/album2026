/**
 * Serviço de dados da Copa 2026 — via Highlightly (Edge Function proxy)
 */
import { supabase } from "@/lib/supabase";

const cache = new Map();
const inflight = new Map();

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
  const dedupeKey = `${endpoint}:${JSON.stringify(params)}`;

  if (inflight.has(dedupeKey)) {
    return inflight.get(dedupeKey);
  }

  const promise = (async () => {
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
  })();

  inflight.set(dedupeKey, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(dedupeKey);
  }
}

/**
 * Formata UTC para horário de Brasília via Intl — funciona igual no browser e no PWA.
 */
export function formatBrasilia(utcStr) {
  const d = new Date(utcStr);
  const tz = "America/Sao_Paulo";

  const date = d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: tz,
  });

  const time = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });

  const dateKey = d.toLocaleDateString("en-CA", { timeZone: tz });

  return { date, time, dateObj: d, dateKey };
}

// Data de hoje em Brasília (apenas YYYY-MM-DD)
export function todayKeyBrasilia() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
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

// ===== ENDPOINTS DE DETALHE (apenas os que funcionam) =====

/**
 * Estatísticas da partida — retorna objeto { "0": {...}, "1": {...} }
 * Funciona para jogos ao vivo e encerrados.
 */
export async function getMatchStatistics(matchId) {
  return proxyFetch("statistics", { matchId });
}

/**
 * Escalações — retorna { homeTeam: {...}, awayTeam: {...} }
 * Funciona para jogos ao vivo e encerrados (vem vazio para futuros).
 */
export async function getLineups(matchId) {
  return proxyFetch("lineups", { matchId });
}

/**
 * Normaliza statistics: objeto {"0","1"} → array [{team, statistics}]
 */
export function normalizeStatistics(raw) {
  if (!raw) return [];
  const teams = [];
  ["0", "1"].forEach(key => {
    const entry = raw[key];
    if (entry && entry.team && Array.isArray(entry.statistics)) {
      teams.push(entry);
    }
  });
  return teams;
}

export function hasValidStatistics(raw) {
  const teams = normalizeStatistics(raw);
  if (teams.length < 2) return false;
  return teams.some(t =>
    (t.statistics ?? []).some(s => s.value !== null && s.value !== undefined && s.value !== 0)
  );
}

/**
 * Normaliza lineups: { homeTeam, awayTeam } com initialLineup em array de arrays.
 * Retorna { home, away } já achatado, ou null se vazio.
 */
export function normalizeLineups(raw) {
  if (!raw || (!raw.homeTeam && !raw.awayTeam)) return null;

  function flatten(teamObj) {
    if (!teamObj) return null;
    // initialLineup é array de arrays (linhas táticas) → achatar
    const starters = Array.isArray(teamObj.initialLineup)
      ? teamObj.initialLineup.flat()
      : [];
    const subs = Array.isArray(teamObj.substitutes) ? teamObj.substitutes : [];

    // Se não tem titulares, considera indisponível
    if (starters.length === 0) return null;

    return {
      id: teamObj.id,
      logo: teamObj.logo,
      formation: teamObj.formation && teamObj.formation !== "Unknown" ? teamObj.formation : null,
      starters,
      substitutes: subs,
    };
  }

  const home = flatten(raw.homeTeam);
  const away = flatten(raw.awayTeam);

  // Se ambos vazios, não há escalação
  if (!home && !away) return null;

  return { home, away };
}
