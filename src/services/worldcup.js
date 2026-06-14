/**
 * Serviço de dados da Copa 2026 — via Highlightly Football API
 * Chama a Edge Function worldcup-proxy do Supabase (a key fica segura no servidor).
 *
 * Estrutura real da Highlightly (soccer.highlightly.net):
 *   /matches    → { data: [ { id, date, round, homeTeam, awayTeam, state }, ... ], pagination }
 *   /standings  → { groups: [ { name, standings: [ { position, team, points, total } ] } ], league }
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

/**
 * Chama a Edge Function worldcup-proxy. A key da Highlightly nunca chega ao frontend.
 */
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

// Converte UTC para horário de Brasília (UTC-3)
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

/**
 * Placar atual de uma partida. A Highlightly entrega como string "3 - 1".
 * Retorna { home, away } com números, ou null quando ainda não há placar.
 */
export function getScore(match) {
  const current = match?.state?.score?.current;
  if (typeof current !== "string") return { home: null, away: null };
  const [h, a] = current.split("-").map((s) => parseInt(s.trim(), 10));
  return {
    home: Number.isFinite(h) ? h : null,
    away: Number.isFinite(a) ? a : null,
  };
}

/**
 * Todos os fixtures da Copa 2026.
 * A Highlightly pagina (limit ~100); a Copa tem 104 jogos, então percorremos as páginas.
 * Cache: 5min se houver jogo ao vivo, 30min caso contrário.
 */
export async function getFixtures() {
  const key = "fixtures_all";
  const cached = getCached(key);
  if (cached) return cached;

  const limit = 100;
  const all = [];
  let offset = 0;

  for (let page = 0; page < 6; page++) {
    const res = await proxyFetch("matches", { limit: String(limit), offset: String(offset) });
    const batch = res?.data ?? (Array.isArray(res) ? res : []);
    all.push(...batch);

    const total = res?.pagination?.totalCount;
    offset += limit;

    const reachedTotal = total != null && all.length >= total;
    const lastPage = batch.length < limit;
    if (reachedTotal || lastPage) break;
  }

  const hasLive = all.some((m) => getMatchStatus(m).type === "live");
  setCache(key, all, hasLive ? 5 * 60 * 1000 : 30 * 60 * 1000);
  return all;
}

/**
 * Standings da Copa 2026 (12 grupos).
 * Retorna o array de grupos: [ { name, standings: [...] }, ... ].
 * Cache: 1 hora.
 */
export async function getStandings() {
  const key = "standings";
  const cached = getCached(key);
  if (cached) return cached;

  const response = await proxyFetch("standings");
  const groups = response?.groups ?? (Array.isArray(response) ? response : []);

  setCache(key, groups, 60 * 60 * 1000);
  return groups;
}

/**
 * Status do jogo em pt-BR a partir de match.state.description.
 * A Highlightly usa frases em inglês ("Second half", "Finished", "Not started"),
 * então a detecção é por palavra-chave (robusta a variações de capitalização/formato).
 */
export function getMatchStatus(match) {
  const desc = (match?.state?.description ?? "").toLowerCase();
  const clock = match?.state?.clock;
  const has = (...keys) => keys.some((k) => desc.includes(k));

  // Encerrados primeiro — "after extra time"/"after penalties" contêm "extra"/"penalt"
  if (has("finished", "full time", "full-time", "ended", "after extra", "after penalt", "awarded", "walkover")) {
    return { label: "Encerrado", type: "finished" };
  }
  if (has("postpone")) return { label: "Adiado", type: "postponed" };
  if (has("cancel")) return { label: "Cancelado", type: "cancelled" };

  // Fases ao vivo
  if (has("penalt")) return { label: "Pênaltis", type: "live" };
  if (has("extra")) return { label: clock ? `Prorr. ${clock}'` : "Prorrogação", type: "live" };
  if (has("halftime", "half time", "half-time", "break", "interval")) {
    return { label: "Intervalo", type: "live" };
  }
  if (has("first half", "second half", "1st half", "2nd half", "in play", "live", "playing")) {
    return { label: clock ? `${clock}'` : "AO VIVO", type: "live" };
  }

  // Não iniciado / agendado / TBD / padrão
  return { label: "Agendado", type: "scheduled" };
}
