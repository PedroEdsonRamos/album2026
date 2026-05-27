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
