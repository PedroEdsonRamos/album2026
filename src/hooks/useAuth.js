import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { sanitizeEmail, sanitizeName } from "@/utils/sanitize";

async function withTimeout(promise, ms, fallback) {
  const timeout = new Promise(resolve =>
    setTimeout(() => resolve(fallback), ms)
  );
  return Promise.race([promise, timeout]);
}

const approvalCacheKey = (userId) => `album2026-approved-${userId}`;

export function useAuth() {
  const [user, setUser]         = useState(null);
  const [session, setSession]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [approved, setApproved] = useState(null);
  // null = ainda verificando | true = aprovado | false = aguardando

  // Ref para leitura do approved atual dentro de closures sem dependências
  const approvedRef = useRef(null);
  const setApprovedSynced = (value) => {
    approvedRef.current = value;
    setApproved(value);
  };

  const checkApproval = async (userId) => {
    if (!userId) { setApprovedSynced(false); return; }

    // Lê cache imediatamente — usuário aprovado nunca bloqueia por rede
    const cacheKey = approvalCacheKey(userId);
    const cached = localStorage.getItem(cacheKey);
    if (cached === "true") {
      setApprovedSynced(true);
      // Continua verificando em background mas não bloqueia a UI
    }

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
          const isApproved = result.data.approved ?? false;
          setApprovedSynced(isApproved);
          if (isApproved) {
            localStorage.setItem(cacheKey, "true");
          } else {
            localStorage.removeItem(cacheKey);
          }
          return;
        }

        if (attempt === 2) {
          console.warn("[useAuth] checkApproval falhou após 2 tentativas");
          // Em falha de rede, confia no cache
          if (cached !== "true") setApprovedSynced(false);
          return;
        }

        await new Promise(r => setTimeout(r, 800));

      } catch (e) {
        console.warn(`[useAuth] checkApproval tentativa ${attempt} falhou:`, e);
        if (attempt === 2) {
          if (cached !== "true") setApprovedSynced(false);
        }
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
          setApprovedSynced(null);
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
        setApprovedSynced(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // TOKEN_REFRESHED e USER_UPDATED: só atualiza a sessão, sem re-verificar aprovação
        if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          setSession(session);
          return;
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
          setSession(null);
          setApprovedSynced(null);
          setLoading(false);
          return;
        }

        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            // Só re-verifica se a aprovação ainda não foi confirmada
            if (approvedRef.current === null) {
              await checkApproval(session.user.id);
            }
          }
          setLoading(false);
          return;
        }

        // Demais eventos (PASSWORD_RECOVERY, etc.)
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizeEmail(email),
      password,
    });

    if (data?.user) {
      checkApproval(data.user.id);
    }

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
    // Limpa cache de aprovação
    if (user?.id) {
      localStorage.removeItem(approvalCacheKey(user.id));
    }

    setUser(null);
    setSession(null);
    setApprovedSynced(null);

    supabase.auth.signOut().catch(e => {
      console.warn("[useAuth] Erro no signOut:", e);
    });

    return { error: null };
  };

  const isGoogleUser = (u) => {
    if (!u) return false;
    return u.app_metadata?.provider === "google" ||
           u.identities?.some(id => id.provider === "google");
  };

  return {
    user,
    session,
    loading,
    approved,
    checkApproval,
    isGoogleUser: isGoogleUser(user),
    signInWithEmail,
    signInWithGoogle,
    signUp,
    resetPassword,
    signOut,
  };
}
