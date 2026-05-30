import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { sanitizeEmail, sanitizeName } from "@/utils/sanitize";

async function withTimeout(promise, ms, fallback) {
  const timeout = new Promise(resolve =>
    setTimeout(() => resolve(fallback), ms)
  );
  return Promise.race([promise, timeout]);
}

export function useAuth() {
  const [user, setUser]         = useState(null);
  const [session, setSession]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [approved, setApproved] = useState(null);
  // null = ainda verificando | true = aprovado | false = aguardando

  const checkApproval = async (userId) => {
    if (!userId) { setApproved(false); return; }

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await withTimeout(
          supabase
            .from("user_profiles")
            .select("approved")
            .eq("id", userId)
            .single(),
          3000,
          { data: null, error: "timeout" }
        );

        if (result.data) {
          setApproved(result.data.approved ?? false);
          return;
        }

        if (attempt === 2) {
          console.warn("[useAuth] checkApproval falhou após 2 tentativas");
          setApproved(false);
          return;
        }

        await new Promise(r => setTimeout(r, 800));

      } catch (e) {
        console.warn(`[useAuth] checkApproval tentativa ${attempt} falhou:`, e);
        if (attempt === 2) setApproved(false);
      }
    }
  };

  useEffect(() => {
    // Timeout global de segurança — nunca fica preso mais de 6 segundos
    const safetyTimeout = setTimeout(() => {
      console.warn("[useAuth] Safety timeout — liberando tela");
      setLoading(false);
    }, 6000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          checkApproval(session.user.id).finally(() => {
            clearTimeout(safetyTimeout);
            setLoading(false);
          });
        } else {
          clearTimeout(safetyTimeout);
          setApproved(null);
          setLoading(false);
        }
      })
      .catch(e => {
        console.error("[useAuth] Erro ao carregar sessão:", e);
        clearTimeout(safetyTimeout);
        setLoading(false);
      });

    // Sincroniza logout entre abas
    const handleStorageChange = (e) => {
      if (e.key?.includes("supabase") && !e.newValue) {
        setUser(null);
        setSession(null);
        setApproved(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkApproval(session.user.id);
        } else {
          setApproved(null);
        }
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
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
      { redirectTo: "https://fifa-world-cup-2026-virtual-collection.vercel.app" }
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
    approved,
    checkApproval,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    resetPassword,
    signOut,
  };
}
