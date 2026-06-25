import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { buildDatabase } from "@/data/database";
import { TEAMS } from "@/data/teams";
import { isFixedType } from "@/utils/stickerTypes";
import {
  loadUserCollection,
  saveSticker,
  clearUserCollection,
} from "@/services/syncService";

const achievementsSent = new Set();

const checkAchievements = async (stickers, userId) => {
  if (!userId) return;
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) return;

  const sendEmail = async (payload) => {
    const key = JSON.stringify(payload);
    if (achievementsSent.has(key)) return;
    achievementsSent.add(key);
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-achievement-email`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
    } catch (e) {
      console.warn("[achievements] Erro ao enviar email:", e);
    }
  };

  for (const team of TEAMS) {
    const teamStickers = stickers.filter(s => s.team === team.id);
    if (teamStickers.length === 0) continue;
    const allOwned = teamStickers.every(s => s.status === "Tenho" || s.status === "Repetida");
    if (allOwned) {
      await sendEmail({ type: "team", teamName: team.name, flag: team.flag });
    }
  }

  const groups = [...new Set(TEAMS.map(t => t.grp))];
  for (const group of groups) {
    const groupTeams = TEAMS.filter(t => t.grp === group);
    const groupStickers = stickers.filter(s => groupTeams.some(t => t.id === s.team));
    if (groupStickers.length === 0) continue;
    const allOwned = groupStickers.every(s => s.status === "Tenho" || s.status === "Repetida");
    if (allOwned) {
      await sendEmail({ type: "group", group });
    }
  }

  const TOTAL = 994;
  const owned = stickers.filter(s => s.status === "Tenho" || s.status === "Repetida").length;
  if (owned >= TOTAL) {
    await sendEmail({ type: "album" });
  }
};

const CACHE_KEY = "album2026-stickers-cache";

/* ===== Helpers de quantidade (modelo do álbum) =====
 * "Faltando" = 0 cópias | "Tenho" = 1 | "Repetida" = duplicates (>= 2).
 * Se `duplicates` representar SOBRAS em vez de total, ajustar APENAS ownedCount.
 */
function ownedCount(s) {
  if (s.status === "Repetida") return s.duplicates || 0;
  if (s.status === "Tenho") return 1;
  return 0;
}

function statusFromCount(owned) {
  if (owned <= 0) return { status: "Faltando", duplicates: 0 };
  if (owned === 1) return { status: "Tenho", duplicates: 0 };
  return { status: "Repetida", duplicates: owned };
}

/** Remove 1 unidade do typeBreakdown (a cópia mais comum), mantendo
 *  soma(typeBreakdown) === duplicates. Retorna novo objeto ou undefined. */
function decrementBreakdown(tb) {
  if (!tb || typeof tb !== "object") return undefined;
  const entries = Object.entries(tb).filter(([, q]) => q > 0);
  if (entries.length === 0) return undefined;
  entries.sort((a, b) => b[1] - a[1]); // tira do tipo com maior quantidade
  const [key] = entries[0];
  const next = { ...tb, [key]: tb[key] - 1 };
  if (next[key] <= 0) delete next[key];
  return Object.keys(next).length ? next : undefined;
}

export function useStickers(userId, addToast) {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("idle");

  const pendingSave = useRef(new Map());
  const saveTimer = useRef(null);
  const addToastRef = useRef(null);
  addToastRef.current = addToast ?? null;

  useEffect(() => {
    if (!userId) return;
    loadCollection();

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      pendingSave.current.clear();
    };
  }, [userId]);

  const loadCollection = async () => {
    setLoading(true);
    const FULL_DB = buildDatabase();

    // Mostra dados do cache imediatamente (se existirem)
    let hasCached = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedStickers = JSON.parse(cached);
        if (Array.isArray(cachedStickers) && cachedStickers.length > 0) {
          setStickers(cachedStickers);
          setLoading(false);
          hasCached = true;
        }
      }
    } catch (e) {
      // cache inválido — ignora
    }

    // Busca dados frescos do Supabase em background
    try {
      const saved = await loadUserCollection(userId);

      if (saved === null) {
        if (!hasCached) setStickers(FULL_DB);
        setSyncStatus("error");
      } else {
        const byCode = new Map(saved.map((s) => [s.code, s]));
        const merged = FULL_DB.map((base) => {
          const remote = byCode.get(base.code);
          if (!remote) return base;
          return {
            ...base,
            status: remote.status,
            duplicates: remote.duplicates,
            // fixed-type stickers (FWC, Escudo, CC) always use the canonical base rarity
            rarity: isFixedType(base) ? base.rarity : remote.rarity,
            typeBreakdown: remote.type_breakdown ?? undefined,
            obs: remote.obs ?? undefined,
            addedAt: remote.added_at ?? null,
          };
        });

        setStickers(merged);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch (_) {}
        setSyncStatus("synced");
      }
    } catch (e) {
      console.error("[useStickers] Erro ao carregar:", e);
      if (!hasCached) setStickers(FULL_DB);
      setSyncStatus("error");
    }

    setLoading(false);
  };

  const scheduleSave = useCallback(
    (sticker) => {
      if (!userId) return;
      pendingSave.current.set(sticker.code, sticker);
      setSyncStatus("syncing");

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const toSave = [...pendingSave.current.values()];
        pendingSave.current.clear();

        const results = await Promise.all(
          toSave.map((s) => saveSticker(userId, s))
        );

        const allOk = results.every(Boolean);
        setSyncStatus(allOk ? "synced" : "error");

        if (!allOk) {
          addToastRef.current?.("Erro ao sincronizar. Tentando novamente...", "warning");
          toSave.forEach(s => pendingSave.current.set(s.code, s));
        }
      }, 800);
    },
    [userId]
  );

  const setStickersAndSync = useCallback(
    (updater) => {
      setStickers((prev) => {
        const next =
          typeof updater === "function" ? updater(prev) : updater;

        next.forEach((s, i) => {
          if (
            prev[i] &&
            (s.status !== prev[i].status ||
              s.duplicates !== prev[i].duplicates ||
              s.rarity !== prev[i].rarity ||
              JSON.stringify(s.typeBreakdown) !==
                JSON.stringify(prev[i].typeBreakdown))
          ) {
            scheduleSave(s);
          }
        });

        setTimeout(() => checkAchievements(next, userId), 500);

        return next;
      });
    },
    [scheduleSave, userId]
  );

  const resetCollection = async () => {
    if (!userId) return;
    setSyncStatus("syncing");
    const ok = await clearUserCollection(userId);
    if (ok) {
      setStickers(buildDatabase());
      setSyncStatus("synced");
    } else {
      setSyncStatus("error");
    }
  };

  /**
   * Aplica uma troca confirmada no álbum:
   *  - cada código em `entrego` → -1 cópia (recalcula status)
   *  - cada código em `recebo`  → +1 cópia (recalcula status)
   * Aceita dois formatos de entrada (compatibilidade):
   *  - antigo: lista de pares `[{ give, receive }]`
   *  - novo:   listas independentes `{ entrego: [...], recebo: [...] }`
   *    (permite trocas desbalanceadas, ex.: 2 por 1)
   * Códigos repetidos aplicam o delta uma vez por ocorrência.
   * @param {Array<{give:Object, receive:Object}>|{entrego:Array, recebo:Array}} input
   */
  const applyTrade = useCallback(
    (input) => {
      if (!userId) return;

      function normalizeTrade(inp) {
        const codeOf = (x) => (typeof x === "string" ? x : x && x.code);
        if (Array.isArray(inp)) {
          // formato antigo: lista de pares
          const entrego = [], recebo = [];
          for (const p of inp) {
            if (p && p.give != null) entrego.push(codeOf(p.give));
            if (p && p.receive != null) recebo.push(codeOf(p.receive));
          }
          return {
            entrego: entrego.filter(Boolean),
            recebo: recebo.filter(Boolean),
          };
        }
        return {
          entrego: ((inp && inp.entrego) || []).map(codeOf).filter(Boolean),
          recebo: ((inp && inp.recebo) || []).map(codeOf).filter(Boolean),
        };
      }

      const { entrego, recebo } = normalizeTrade(input);
      if (entrego.length === 0 && recebo.length === 0) return;

      // Conta ocorrências: cada ocorrência aplica um delta.
      const giveCounts = new Map();
      for (const c of entrego) giveCounts.set(c, (giveCounts.get(c) || 0) + 1);
      const receiveCounts = new Map();
      for (const c of recebo) receiveCounts.set(c, (receiveCounts.get(c) || 0) + 1);

      setStickersAndSync((prev) =>
        prev.map((s) => {
          const gives = giveCounts.get(s.code) || 0;
          const receives = receiveCounts.get(s.code) || 0;
          if (gives === 0 && receives === 0) return s;

          let owned = ownedCount(s);
          let tb = s.typeBreakdown;

          // Dou: -1 por ocorrência
          for (let i = 0; i < gives; i++) {
            owned = Math.max(0, owned - 1);
            tb = owned >= 2 ? decrementBreakdown(tb) : undefined;
          }
          // Recebo: +1 por ocorrência
          for (let i = 0; i < receives; i++) {
            owned = owned + 1;
            if (owned >= 2) {
              // base = cópias que já existiam; +1 da figurinha recebida
              const base =
                tb && Object.keys(tb).length
                  ? { ...tb }
                  : { [s.rarity]: owned - 1 };
              base[s.rarity] = (base[s.rarity] || 0) + 1;
              tb = base;
            } else {
              tb = undefined;
            }
          }

          const recalc = statusFromCount(owned);
          return { ...s, ...recalc, typeBreakdown: tb };
        })
      );
    },
    [userId, setStickersAndSync]
  );

  /** Opção oculta: remove TODAS as repetidas, mantendo 1 cópia (a do álbum). */
  const clearAllDuplicates = useCallback(() => {
    if (!userId) return;
    setStickersAndSync((prev) =>
      prev.map((s) =>
        s.status === "Repetida"
          ? { ...s, status: "Tenho", duplicates: 0, typeBreakdown: undefined }
          : s
      )
    );
  }, [userId, setStickersAndSync]);

  return {
    stickers,
    setStickers: setStickersAndSync,
    loading,
    syncStatus,
    resetCollection,
    applyTrade,        // ← novo
    clearAllDuplicates, // ← novo
  };
}
