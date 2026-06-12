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

  return {
    stickers,
    setStickers: setStickersAndSync,
    loading,
    syncStatus,
    resetCollection,
  };
}
