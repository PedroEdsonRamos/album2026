import { supabase } from "@/lib/supabase";

export async function loadUserCollection(userId) {
  const { data, error } = await supabase
    .from("user_stickers")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[syncService] Erro ao carregar coleção:", error);
    return null;
  }

  return data ?? [];
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

  const { error } = await supabase
    .from("user_stickers")
    .upsert(payload, {
      onConflict: "user_id,code",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("[syncService] Erro ao salvar sticker:", error.message);
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
      return { ok: false, error: "Sessão inválida" };
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

    const result = await response.json();

    if (!response.ok) {
      console.error("[deleteUserAccount] Erro:", result.error);
      return { ok: false, error: result.error ?? "Erro ao excluir conta" };
    }

    await supabase.auth.signOut();
    return { ok: true };

  } catch (e) {
    console.error("[deleteUserAccount] Erro inesperado:", e);
    return { ok: false, error: "Erro de conexão. Tente novamente." };
  }
}
