import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { sanitizeEmail, sanitizeName } from "@/utils/sanitize";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Logout automático após 30 min de inatividade
  useEffect(() => {
    if (!user) return;

    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        await supabase.auth.signOut();
      }, 30 * 60 * 1000);
    };

    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  // Sincroniza logout entre abas do browser
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes("supabase") && !e.newValue) {
        setUser(null);
        setSession(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizeEmail(email),
      password,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    return { data, error };
  };

const signUp = async (email, password, displayName) => {
  const { data, error } = await supabase.auth.signUp({
    email: sanitizeEmail(email),
    password,
    options: {
      data: { full_name: sanitizeName(displayName) },
      emailRedirectTo: "https://fifa-world-cup-2026-virtual-collection.vercel.app",
    },
  });

  // Supabase retorna sucesso mas com identities vazio
  // quando o email já está cadastrado
  if (data?.user && data.user.identities?.length === 0) {
    return {
      data: null,
      error: { message: "User already registered" },
    };
  }

  return { data, error };
};

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      sanitizeEmail(email),
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    resetPassword,
    signOut,
  };
}
