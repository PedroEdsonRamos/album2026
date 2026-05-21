import { FULL_DB } from "@/data/database.js";

export const STORAGE_KEY = "album2026-stickers-v1";

export function loadStickersFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) return FULL_DB;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return FULL_DB;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || saved.length !== FULL_DB.length) return FULL_DB;
    const byCode = new Map(saved.map((s) => [s.code, s]));
    return FULL_DB.map((base) => {
      const s = byCode.get(base.code);
      if (!s) return base;
      return {
        ...base,
        status: s.status ?? base.status,
        duplicates: s.duplicates ?? base.duplicates,
        rarity: s.rarity ?? base.rarity,
        obs: s.obs ?? base.obs,
        addedAt: s.addedAt ?? base.addedAt,
      };
    });
  } catch (e) {
    console.warn("Erro ao carregar localStorage:", e);
    return FULL_DB;
  }
}

export function saveStickersToStorage(stickers) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const minimal = stickers.map((s) => ({
      code: s.code,
      status: s.status,
      duplicates: s.duplicates,
      rarity: s.rarity,
      obs: s.obs,
      addedAt: s.addedAt,
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
  } catch (e) {
    console.warn("Erro ao salvar localStorage:", e);
  }
}
