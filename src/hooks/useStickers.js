import { useState, useEffect, useRef, useCallback } from "react";
import { buildDatabase } from "@/data/database";
import {
  loadUserCollection,
  saveSticker,
  clearUserCollection,
} from "@/services/syncService";

export function useStickers(userId) {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("idle");

  const pendingSave = useRef(new Map());
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!userId) return;
    loadCollection();
  }, [userId]);

  const loadCollection = async () => {
    setLoading(true);
    const FULL_DB = buildDatabase();

    try {
      const saved = await loadUserCollection(userId);

      if (saved === null) {
        setStickers(FULL_DB);
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
            rarity: remote.rarity,
            typeBreakdown: remote.type_breakdown ?? undefined,
            obs: remote.obs ?? undefined,
            addedAt: remote.added_at ?? null,
          };
        });

        setStickers(merged);
        setSyncStatus("synced");
      }
    } catch (e) {
      console.error("[useStickers] Erro ao carregar:", e);
      setStickers(buildDatabase());
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

        setSyncStatus(results.every(Boolean) ? "synced" : "error");
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

        return next;
      });
    },
    [scheduleSave]
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
