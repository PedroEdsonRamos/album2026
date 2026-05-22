import { FINISH, rarToFinish, getFinish } from "@/styles/finishes.js";
import { teamInfo } from "@/utils/teamInfo.js";
import { C } from "@/styles/tokens.js";

const RARITY_MAP = {
  Regular: "Normal",
  "Lilás": "Lilás",
  Bronze: "Bronze",
  Prata: "Prata",
  Ouro: "Gold",
};

const FINISH_TO_RARITY = {
  Regular: "Normal",
  "Lilás": "Lilás",
  Bronze: "Bronze",
  Prata: "Prata",
  Ouro: "Gold",
};

export function StickerEditModal({ sticker, onChange, onClose, onSave }) {
  const et = teamInfo(sticker.team);
  const ef = getFinish(sticker.rarity);

  const updateTypeBreakdown = (rarityKey, delta) => {
    onChange((prev) => {
      const current = prev.typeBreakdown ?? {};
      const newVal = Math.max(0, (current[rarityKey] ?? 0) + delta);
      const updated = { ...current };
      if (newVal === 0) {
        delete updated[rarityKey];
      } else {
        updated[rarityKey] = newVal;
      }
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      return {
        ...prev,
        typeBreakdown: Object.keys(updated).length > 0 ? updated : undefined,
        duplicates: total,
        rarity: Object.keys(updated).length === 1 ? Object.keys(updated)[0] : prev.rarity,
      };
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 8000,
        background: "rgba(6,6,14,0.88)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.panelHi,
          border: `1px solid ${ef.border}`,
          borderRadius: 20,
          padding: "24px",
          width: "100%",
          maxWidth: 340,
          animation: "fadeIn .25s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 36 }}>{et.flag}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: C.t3 }}>
              {sticker.code} · nº {sticker.number}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{sticker.name}</div>
            <div style={{ fontSize: 11, color: C.t2 }}>
              {sticker.teamName} · {sticker.position}
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: C.t2,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          Status
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {["Faltando", "Tenho", "Repetida"].map((st) => {
            const active = sticker.status === st;
            const col = st === "Tenho" ? C.green : st === "Repetida" ? C.violet : C.red;
            return (
              <button
                key={st}
                onClick={() =>
                  onChange((p) => ({
                    ...p,
                    status: st,
                    duplicates: st === "Repetida" ? Math.max(p.duplicates || 0, 1) : 0,
                    typeBreakdown: st === "Repetida" ? p.typeBreakdown : undefined,
                  }))
                }
                className="fc-btn"
                style={{
                  flex: 1,
                  background: active ? col + "22" : "transparent",
                  border: `1px solid ${active ? col + "66" : C.borderHi}`,
                  color: active ? col : C.t3,
                  borderRadius: 10,
                  padding: "10px 6px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .18s",
                }}
              >
                {st}
              </button>
            );
          })}
        </div>

        {sticker.status === "Repetida" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
              Quantidade por tipo
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(FINISH).map(([finishKey, fin]) => {
                const rarityKey = FINISH_TO_RARITY[finishKey] ?? "Normal";
                const qty = sticker.typeBreakdown?.[rarityKey] ?? 0;
                return (
                  <div key={finishKey} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ background: fin.bg, border: `1px solid ${fin.border}`, color: fin.color, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, width: 72, textAlign: "center", flexShrink: 0 }}>
                      {fin.label}
                    </span>
                    <button
                      onClick={() => updateTypeBreakdown(rarityKey, -1)}
                      style={{ width: 32, height: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
                    >−</button>
                    <span style={{ width: 28, textAlign: "center", fontSize: 15, fontWeight: 700, color: qty > 0 ? "#fff" : C.t4 }}>
                      {qty}
                    </span>
                    <button
                      onClick={() => updateTypeBreakdown(rarityKey, +1)}
                      style={{ width: 32, height: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
                    >+</button>
                    {qty > 0 && (
                      <span style={{ fontSize: 11, color: C.t3 }}>{qty === 1 ? "1 cópia" : `${qty} cópias`}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: C.t3, marginTop: 10, textAlign: "right" }}>
              Total: {Object.values(sticker.typeBreakdown ?? {}).reduce((a, b) => a + b, 0)}× repetidas
            </div>
          </div>
        )}

        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: C.t2,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          Tipo
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {Object.entries(FINISH).map(([key, fin]) => {
            const active = rarToFinish(sticker.rarity) === key;
            return (
              <button
                key={key}
                onClick={() => onChange((p) => ({ ...p, rarity: RARITY_MAP[key] || "Normal" }))}
                className="fc-btn"
                style={{
                  flex: 1,
                  minWidth: 54,
                  background: active ? fin.bg : "transparent",
                  border: `1px solid ${active ? fin.border : C.borderHi}`,
                  color: active ? fin.color : C.t3,
                  borderRadius: 10,
                  padding: "10px 6px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .18s",
                }}
              >
                {fin.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: C.surface,
              border: `1px solid ${C.borderHi}`,
              color: C.t2,
              borderRadius: 12,
              padding: "12px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSave({
                status: sticker.status,
                rarity: sticker.rarity,
                duplicates: sticker.duplicates,
              })
            }
            style={{
              flex: 2,
              background: `linear-gradient(135deg,${C.amber},${C.amberLt})`,
              border: "none",
              borderRadius: 12,
              padding: "12px",
              fontSize: 13,
              fontWeight: 800,
              color: "#000",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: `0 4px 16px ${C.amberGlow}`,
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
