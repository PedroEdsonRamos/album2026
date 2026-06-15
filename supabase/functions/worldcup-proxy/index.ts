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

// Endpoints permitidos + TTL de cache em segundos
const ENDPOINT_CONFIG: Record<string, { ttl: number; ttlLive?: number }> = {
  "matches":         { ttl: 1800, ttlLive: 120 },   // 30min, 2min se há live
  "standings":       { ttl: 1800 },                  // 30 min
  "lineups":         { ttl: 3600 },                  // 1 hora
  "statistics":      { ttl: 120 },                   // 2 min (durante jogo) ou final
  "live-events":     { ttl: 30 },                    // 30 segundos
  "head-2-head":     { ttl: 604800 },                // 7 dias (raramente muda)
  "last-five-games": { ttl: 86400 },                 // 24 horas
  "highlights":      { ttl: 600 },                   // 10 min
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

    // Sempre adiciona leagueId e season
    const fullParams = { leagueId: LEAGUE_ID, season: SEASON, ...params };
    const cacheKey = buildCacheKey(endpoint, fullParams);

    // 1. Tenta cache primeiro
    const cached = await getFromCache(supabase, cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify({ ...cached, _cached: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Cache miss → busca na API
    const queryParams = new URLSearchParams(
      Object.entries(fullParams).map(([k, v]) => [k, String(v)])
    );
    const url = `${HIGHLIGHTLY_BASE}/${endpoint}?${queryParams.toString()}`;

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
