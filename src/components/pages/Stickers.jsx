import { useState, useEffect, useCallback, useMemo } from "react";
import { MY_CODES } from "@/data/userCollection.js";
import { teamInfo } from "@/utils/teamInfo.js";
import { FINISH, rarToFinish } from "@/styles/finishes.js";
import { Icon } from "@/components/atoms/Icon.jsx";
import { StickerCard } from "@/components/molecules/StickerCard.jsx";
import { StickerEditModal } from "@/components/organisms/StickerEditModal.jsx";
import { C } from "@/styles/tokens.js";

export function Stickers({ stickers, selectedTeam, setStickers, addToast, initialFilter }) {
  const [search, setSearch] = useState(initialFilter?.search || "");
  const [fStatus, setFStatus] = useState(initialFilter?.status || "Todos");
  const [fFinish, setFFinish] = useState(initialFilter?.finish || "Todos");

  useEffect(() => {
    if (!initialFilter) return;
    if (initialFilter.search !== undefined) setSearch(initialFilter.search);
    if (initialFilter.status !== undefined) setFStatus(initialFilter.status || "Todos");
    if (initialFilter.finish !== undefined) setFFinish(initialFilter.finish || "Todos");
  }, [initialFilter?._ts]);

  const team = selectedTeam ? teamInfo(selectedTeam) : null;
  const filtered = useMemo(
    () =>
      stickers.filter((s) => {
        if (selectedTeam && s.team !== selectedTeam) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !s.name.toLowerCase().includes(q) &&
            !s.code.toLowerCase().includes(q) &&
            !(s.teamName || "").toLowerCase().includes(q)
          )
            return false;
        }
        if (fStatus === "Minhas") {
          if (!MY_CODES.has(s.code)) return false;
        } else if (fStatus !== "Todos" && s.status !== fStatus) return false;
        if (fFinish !== "Todos" && rarToFinish(s.rarity) !== fFinish) return false;
        return true;
      }),
    [stickers, selectedTeam, search, fStatus, fFinish]
  );

  const [editSticker, setEditSticker] = useState(null);

  const handleStickerClick = useCallback(
    (id) => {
      const s = stickers.find((x) => x.id === id);
      if (s) setEditSticker({ ...s });
    },
    [stickers]
  );

  const saveEdit = (updates) => {
    if (!editSticker) return;
    setStickers((prev) =>
      prev.map((s) =>
        s.id === editSticker.id
          ? {
              ...s,
              ...updates,
              addedAt:
                updates.status !== "Faltando" ? s.addedAt || new Date().toISOString() : null,
            }
          : s
      )
    );
    const msg =
      updates.status === "Tenho"
        ? "Figurinha coletada"
        : updates.status === "Repetida"
        ? "Marcada como repetida"
        : "Removida da coleção";
    addToast(msg, updates.status === "Faltando" ? "info" : "success");
    setEditSticker(null);
  };

  const owned = filtered.filter((s) => s.status === "Tenho").length;

  return (
    <div>
      {team && (
        <div
          style={{
            background: `linear-gradient(135deg, ${team.color || C.amber}20, transparent)`,
            borderRadius: 14,
            padding: "12px 16px",
            border: `1px solid ${team.color || C.amber}30`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 36 }}>{team.flag}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{team.name}</div>
            <div style={{ fontSize: 11, color: C.t3 }}>
              {owned}/{filtered.length} figurinhas coletadas
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "relative", marginBottom: 12 }}>
        <div
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: C.t3,
          }}
        >
          <Icon name="search" size={15} />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar figurinha ou código..."
          style={{
            width: "100%",
            background: C.surfaceHi,
            border: `1px solid ${C.borderHi}`,
            borderRadius: 10,
            padding: "10px 12px 10px 36px",
            color: "#fff",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div
        style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 8 }}
      >
        {["Todos", "Minhas", "Tenho", "Faltando", "Repetida"].map((f) => (
          <button
            key={f}
            onClick={() => setFStatus(f)}
            className="fc-btn"
            style={{
              background: fStatus === f ? C.amberDim : C.surface,
              border: `1px solid ${fStatus === f ? C.amber + "66" : C.borderHi}`,
              color: fStatus === f ? C.amber : C.t2,
              borderRadius: 999,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              flexShrink: 0,
              transition: "all .18s ease",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}
      >
        {["Todos", ...Object.keys(FINISH)].map((f) => {
          const fin = FINISH[f];
          return (
            <button
              key={f}
              onClick={() => setFFinish(f)}
              className="fc-btn"
              style={{
                background: fFinish === f ? (fin ? fin.bg : C.amberDim) : C.surface,
                border: `1px solid ${fFinish === f ? (fin ? fin.border : C.amber + "66") : C.borderHi}`,
                color: fFinish === f ? (fin ? fin.color : C.amber) : C.t2,
                borderRadius: 999,
                padding: "5px 12px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
                flexShrink: 0,
                transition: "all .18s ease",
              }}
            >
              {f === "Todos" ? "Todos" : f}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: C.t3, marginBottom: 10 }}>
        {filtered.length} figurinhas • toque para editar
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {filtered.map((s, i) => (
          <StickerCard key={s.id} s={s} onToggle={handleStickerClick} delay={(i % 10) * 0.03} />
        ))}
      </div>

      {editSticker && (
        <StickerEditModal
          sticker={editSticker}
          onChange={setEditSticker}
          onClose={() => setEditSticker(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}
