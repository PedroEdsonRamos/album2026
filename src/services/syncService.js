import { supabase } from "@/lib/supabase";

let activeController = null;

async function withRetry(fn, maxAttempts = 2, delayMs = 800) {
  let lastError;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await fn();
      if (!result?.error) return result;
      lastError = result.error;
    } catch (e) {
      lastError = e;
    }
    if (i < maxAttempts - 1) {
      await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  console.error("[syncService] Falhou após", maxAttempts, "tentativas:", lastError);
  return { data: null, error: lastError };
}

export async function loadUserCollection(userId) {
  if (activeController) activeController.abort();
  activeController = new AbortController();
  const { signal } = activeController;

  const result = await withRetry(() =>
    supabase
      .from("user_stickers")
      .select("*")
      .eq("user_id", userId)
      .abortSignal(signal)
  );

  if (signal.aborted || result.error?.name === "AbortError") return null;

  if (result.error) {
    console.error("[syncService] Erro ao carregar coleção:", result.error);
    return null;
  }

  return result.data ?? [];
}

export async function saveSticker(userId, sticker) {
  const payload = {
    user_id: userId,
    code: sticker.code,
    status: sticker.status,
    duplicates: sticker.duplicates ?? 0,
    rarity: sticker.rarity,
    type_breakdown: sticker.typeBreakdown ?? null,
    obs: sticker.obs ?? null,
    added_at: sticker.addedAt ?? null,
  };

  const result = await withRetry(() =>
    supabase
      .from("user_stickers")
      .upsert(payload, { onConflict: "user_id,code", ignoreDuplicates: false })
  );

  if (result.error) {
    console.error("[syncService] Erro ao salvar sticker:", result.error.message);
    return false;
  }
  return true;
}

export async function saveStickers(userId, stickers) {
  const modified = stickers.filter(
    (s) => s.status !== "Faltando" || s.obs || s.typeBreakdown
  );

  if (modified.length === 0) return true;

  const payloads = modified.map((s) => ({
    user_id: userId,
    code: s.code,
    status: s.status,
    duplicates: s.duplicates ?? 0,
    rarity: s.rarity,
    type_breakdown: s.typeBreakdown ?? null,
    obs: s.obs ?? null,
    added_at: s.addedAt ?? null,
  }));

  const { error } = await supabase
    .from("user_stickers")
    .upsert(payloads, {
      onConflict: "user_id,code",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("[syncService] Erro ao salvar batch:", error.message);
    return false;
  }
  return true;
}

export async function clearUserCollection(userId) {
  const { error } = await supabase
    .from("user_stickers")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("[syncService] Erro ao limpar coleção:", error.message);
    return false;
  }
  return true;
}

export async function deleteUserAccount(_userId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { ok: false, error: "Sessão inválida. Faça login novamente." };
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let errMsg = "Erro ao excluir conta";
      try {
        const result = await response.json();
        errMsg = result.error ?? errMsg;
      } catch {}
      console.error("[deleteUserAccount] Erro:", errMsg);
      return { ok: false, error: errMsg };
    }

    await supabase.auth.signOut();

    // Limpa cache de aprovação de todos os usuários neste dispositivo
    Object.keys(localStorage)
      .filter((k) => k.startsWith("album2026-approved-"))
      .forEach((k) => localStorage.removeItem(k));

    return { ok: true };

  } catch (e) {
    console.error("[deleteUserAccount] Erro inesperado:", e);
    return {
      ok: false,
      error: e.message?.includes("fetch")
        ? "Sem conexão. Verifique sua internet e tente novamente."
        : "Erro inesperado. Tente novamente.",
    };
  }
}
