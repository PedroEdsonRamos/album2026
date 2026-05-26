import { FULL_DB } from "@/data/database.js";

export const STORAGE_KEY = "album2026-stickers-v1";

// Prefixos de chaves que pertencem ao app (em qualquer versão)
const APP_KEY_PATTERNS = ["album2026", "vite-pwa", "workbox"];

export function clearStorage() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && APP_KEY_PATTERNS.some((p) => key.includes(p))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return true;
  } catch (e) {
    console.warn("[clearStorage] Erro:", e);
    return false;
  }
}

export async function clearServiceWorkerCache() {
  if (!("caches" in window)) return;
  try {
    const names = await caches.keys();
    const appCaches = names.filter((n) => n.includes("album2026") || n.includes("workbox"));
    await Promise.all(appCaches.map((n) => caches.delete(n)));
  } catch (e) {
    console.warn("[clearServiceWorkerCache] Erro:", e);
  }
}

export function loadStickersFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) return FULL_DB;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);

    // Migra chaves legadas para a chave atual
    if (!raw) {
      for (const lk of ["album2026-stickers", "album2026"]) {
        raw = localStorage.getItem(lk);
        if (raw) {
          localStorage.setItem(STORAGE_KEY, raw);
          localStorage.removeItem(lk);
          break;
        }
      }
    }

    if (!raw) return FULL_DB;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || saved.length !== FULL_DB.length) return FULL_DB;

    const byCode = new Map(saved.map((s) => [s.code, s]));
    return FULL_DB.map((base) => {
      const s = byCode.get(base.code);
      if (!s) return base;

      const merged = {
        ...base,
        status: s.status ?? base.status,
        duplicates: s.duplicates ?? base.duplicates,
        rarity: s.rarity ?? base.rarity,
        obs: s.obs ?? base.obs,
        addedAt: s.addedAt ?? base.addedAt,
        typeBreakdown: s.typeBreakdown,
      };

      if (merged.status === "Repetida" && !merged.typeBreakdown && merged.duplicates > 0) {
        merged.typeBreakdown = { [merged.rarity]: merged.duplicates };
      }

      // Migra valores de rarity legados
      if (merged.rarity === "Normal") merged.rarity = "Comum";
      if (merged.rarity === "Prata" && (merged.team === "FWC" || merged.position === "Escudo")) {
        merged.rarity = "Metalizado";
      }
      if (merged.typeBreakdown) {
        const migrated = {};
        Object.entries(merged.typeBreakdown).forEach(([k, v]) => {
          const key = k === "Normal" ? "Comum" : k;
          migrated[key] = (migrated[key] ?? 0) + v;
        });
        merged.typeBreakdown = Object.keys(migrated).length > 0 ? migrated : undefined;
      }

      return merged;
    });
  } catch (e) {
    console.warn("[loadStickersFromStorage] Erro ao carregar:", e);
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
      typeBreakdown: s.typeBreakdown,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
  } catch (e) {
    console.warn("[saveStickersToStorage] Erro:", e);
  }
}
