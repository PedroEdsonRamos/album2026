const BASE_URL = "https://v3.football.api-sports.io";
const LEAGUE = 1;
const SEASON = 2026;

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

async function apiFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries({ league: LEAGUE, season: SEASON, ...params })
    .forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY },
  });

  if (!res.ok) throw new Error(`API-Football ${res.status}`);
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0)
    throw new Error(Object.values(json.errors).join(", "));
  return json.response;
}

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

export async function getFixtures() {
  const key = "fixtures_all";
  const cached = getCached(key);
  if (cached) return cached;

  const data = await apiFetch("/fixtures");
  const hasLive = data.some(f =>
    ["1H", "HT", "2H", "ET", "P"].includes(f.fixture.status.short)
  );
  setCache(key, data, hasLive ? 5 * 60 * 1000 : 30 * 60 * 1000);
  return data;
}

export async function getStandings() {
  const key = "standings";
  const cached = getCached(key);
  if (cached) return cached;

  const data = await apiFetch("/standings");
  setCache(key, data, 60 * 60 * 1000);
  return data;
}

export function getMatchStatus(f) {
  const s = f.fixture.status.short;
  const e = f.fixture.status.elapsed;
  const map = {
    NS:   { label: "Agendado",     type: "scheduled" },
    "1H": { label: `${e}'`,        type: "live" },
    HT:   { label: "Intervalo",    type: "live" },
    "2H": { label: `${e}'`,        type: "live" },
    ET:   { label: `Prorr. ${e}'`, type: "live" },
    P:    { label: "Pênaltis",     type: "live" },
    FT:   { label: "Encerrado",    type: "finished" },
    AET:  { label: "Enc. (PE)",    type: "finished" },
    PEN:  { label: "Enc. (PEN)",   type: "finished" },
    PST:  { label: "Adiado",       type: "postponed" },
    CANC: { label: "Cancelado",    type: "cancelled" },
  };
  return map[s] ?? { label: s, type: "other" };
}
