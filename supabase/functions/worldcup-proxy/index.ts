const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const HIGHLIGHTLY_BASE = "https://soccer.highlightly.net";
const LEAGUE_ID = 1635;
const SEASON = 2026;

const ALLOWED_ENDPOINTS = new Set([
  "matches",
  "standings",
  "head-2-head",
  "last-five-games",
]);

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

    const { endpoint, params = {} } = await req.json();

    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
      return new Response(
        JSON.stringify({ error: `Endpoint não permitido: ${endpoint}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const queryParams = new URLSearchParams({
      leagueId: String(LEAGUE_ID),
      season: String(SEASON),
      ...params,
    });

    const url = `${HIGHLIGHTLY_BASE}/${endpoint}?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: { "x-api-key": apiKey },
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({ error: `Highlightly ${response.status}: ${text}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});