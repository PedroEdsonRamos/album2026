import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Supabase] Variáveis de ambiente não configuradas.\n" +
      "Crie um arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "album2026-auth",
    storage: {
      getItem: (key) => {
        try { return localStorage.getItem(key); }
        catch { return null; }
      },
      setItem: (key, value) => {
        try { localStorage.setItem(key, value); }
        catch {}
      },
      removeItem: (key) => {
        try { localStorage.removeItem(key); }
        catch {}
      },
    },
  },
});

export async function testConnection() {
  try {
    const { error } = await supabase.from("_test_connection").select("*").limit(1);
    // Qualquer erro relacionado à tabela não existir = conexão OK
    if (error?.code === "42P01" ||
        error?.code === "PGRST116" ||
        error?.message?.includes("does not exist") ||
        error?.message?.includes("schema cache")) {
      console.log("✅ Supabase conectado com sucesso!");
      return { ok: true };
    }
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
