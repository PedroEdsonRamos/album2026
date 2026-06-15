import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const HIGHLIGHTLY_BASE = "https://soccer.highlightly.net";
const HIGHLIGHTLY_HOST = "soccer.highlightly.net";
const LEAGUE_ID = 1635;
const SEASON = 2026;

// Endpoints permitidos + configuração de cache/montagem de URL
// - ttl / ttlLive: cache em segundos
// - pathParam: se houver, o valor desse param vai no PATH (não na query)
// - scopeToLeague: se true, adiciona leagueId+season na query
const ENDPOINT_CONFIG: Record<string, {
  ttl: number;
  ttlLive?: number;
  pathParam?: string;
  scopeToLeague: boolean;
}> = {
  "matches":         { ttl: 1800, ttlLive: 120, scopeToLeague: true },   // 30min, 2min se há live
  "standings":       { ttl: 1800, scopeToLeague: true },                  // 30 min
  "lineups":         { ttl: 3600, pathParam: "matchId", scopeToLeague: false },  // 1 hora
  "statistics":      { ttl: 120, pathParam: "matchId", scopeToLeague: false },   // 2 min (durante jogo) ou final
  "live-events":     { ttl: 30, pathParam: "matchId", scopeToLeague: false },    // 30 segundos
  "head-2-head":     { ttl: 604800, scopeToLeague: false },               // 7 dias (raramente muda)
  "last-five-games": { ttl: 86400, pathParam: "teamId", scopeToLeague: false },  // 24 horas
  "highlights":      { ttl: 600, scopeToLeague: false },                  // 10 min
};

// Prefixo de path de cada endpoint na Highlightly
const ENDPOINT_PATHS: Record<string, string> = {
  "matches": "/matches",
  "standings": "/standings",
  "lineups": "/lineups",
  "statistics": "/statistics",
  "live-events": "/live-events",
  "head-2-head": "/head-2-head",
  "last-five-games": "/last-five-games",
  "highlights": "/highlights",
};

function buildCacheKey(endpoint: string, params: Record<string, unknown>) {
  const sorted = Object.keys(params).sort()
    .map(k => `${k}=${params[k]}`).join("&");
  return `${endpoint}?${sorted}`;
}

async function getFromCache(supabase: any, key: string) {
  const { data, error } = await supabase
    .from("api_cache")
    .select("data, expires_at")
    .eq("cache_key", key)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  return data.data;
}

async function saveToCache(supabase: any, key: string, data: any, ttlSeconds: number) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  await supabase.from("api_cache").upsert({
    cache_key: key,
    data,
    expires_at: expiresAt,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("HIGHLIGHTLY_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key não configurada no servidor" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { endpoint, params = {} } = await req.json();

    const config = ENDPOINT_CONFIG[endpoint];
    if (!config) {
      return new Response(
        JSON.stringify({ error: `Endpoint não permitido: ${endpoint}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Monta os params finais conforme o tipo de endpoint
    const finalParams: Record<string, string> = {};
    let pathSuffix = "";

    if (config.pathParam) {
      const pathValue = params[config.pathParam];
      if (pathValue === undefined || pathValue === null || pathValue === "") {
        return new Response(
          JSON.stringify({ error: `Parâmetro ${config.pathParam} obrigatório` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      pathSuffix = `/${pathValue}`;
      // Demais params (exceto o pathParam) vão na query
      Object.entries(params).forEach(([k, v]) => {
        if (k !== config.pathParam) finalParams[k] = String(v);
      });
    } else {
      Object.entries(params).forEach(([k, v]) => { finalParams[k] = String(v); });
    }

    // leagueId+season só onde faz sentido
    if (config.scopeToLeague) {
      finalParams.leagueId = String(LEAGUE_ID);
      finalParams.season = String(SEASON);
    }

    // Cache key inclui todos os params relevantes (inclusive o pathParam)
    const cacheKey = buildCacheKey(endpoint, { ...params, ...finalParams });

    // 1. Tenta cache primeiro
    const cached = await getFromCache(supabase, cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify({ ...cached, _cached: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Cache miss → busca na API
    let url = `${HIGHLIGHTLY_BASE}${ENDPOINT_PATHS[endpoint]}${pathSuffix}`;
    const queryString = new URLSearchParams(finalParams).toString();
    if (queryString) url += `?${queryString}`;

    const apiResponse = await fetch(url, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": HIGHLIGHTLY_HOST,
      },
    });

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      return new Response(
        JSON.stringify({ error: `Highlightly ${apiResponse.status}: ${text}` }),
        { status: apiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await apiResponse.json();

    // Decide TTL: se for matches e tem live, usa TTL menor
    let ttl = config.ttl;
    if (endpoint === "matches" && config.ttlLive) {
      const matches = Array.isArray(data) ? data : (data.data ?? []);
      const hasLive = Array.isArray(matches) && matches.some((m: any) => {
        const s = (m.state?.description ?? m.status ?? "").toUpperCase();
        return ["IN_PLAY","LIVE","HALFTIME","FIRST_HALF","SECOND_HALF","ET","P"].includes(s);
      });
      if (hasLive) ttl = config.ttlLive;
    }

    // 3. Salva no cache (não bloqueia resposta)
    saveToCache(supabase, cacheKey, data, ttl).catch(() => {});

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
