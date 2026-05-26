import { useRef } from "react";
import { FINISH, rarToFinish, getFinish } from "@/styles/finishes.js";
import { teamInfo } from "@/utils/teamInfo.js";
import { C } from "@/styles/tokens.js";
import { getStickerCategory, isFixedType, isTypeAllowed, CATEGORY_LABEL } from "@/utils/stickerTypes.js";

const RARITY_MAP = {
  Comum: "Comum",
  "Lilás": "Lilás",
  Bronze: "Bronze",
  Prata: "Prata",
  Ouro: "Ouro",
  Metalizado: "Metalizado",
  "Coca-Cola": "Coca-Cola",
};

const FINISH_TO_RARITY = {
  Comum: "Comum",
  "Lilás": "Lilás",
  Bronze: "Bronze",
  Prata: "Prata",
  Ouro: "Ouro",
  Metalizado: "Metalizado",
  "Coca-Cola": "Coca-Cola",
};

export function StickerEditModal({ sticker, onChange, onClose, onSave }) {
  const originalStatus = useRef(sticker.status).current;
  const et = teamInfo(sticker.team);
  const ef = getFinish(sticker.rarity);
  const category = getStickerCategory(sticker);
  const fixed = isFixedType(sticker);
  const totalBreakdown = Object.values(sticker.typeBreakdown ?? {}).reduce((a, b) => a + b, 0);
  const requiresMinTwo = originalStatus === "Faltando" && sticker.status === "Repetida";
  const canSave = !requiresMinTwo || totalBreakdown >= 2;

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
              {sticker.code}
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
              {Object.entries(FINISH).filter(([finishKey]) => isTypeAllowed(sticker, finishKey)).map(([finishKey, fin]) => {
                const rarityKey = FINISH_TO_RARITY[finishKey] ?? "Comum";
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

        {sticker.status !== "Repetida" && (
          <>
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
              <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "none", letterSpacing: 0 }}>
                {CATEGORY_LABEL[category]}
              </span>
            </div>
            {fixed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ background: ef.bg, border: `1px solid ${ef.border}`, color: ef.color, borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 700 }}>
                  {ef.label}
                </span>
                <span style={{ fontSize: 11, color: C.t3 }}>🔒 automático para {CATEGORY_LABEL[category]}</span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                {Object.entries(FINISH).map(([key, fin]) => {
                  const active = rarToFinish(sticker.rarity) === key;
                  const allowed = isTypeAllowed(sticker, key);
                  return (
                    <button
                      key={key}
                      onClick={() => allowed && onChange((p) => ({ ...p, rarity: RARITY_MAP[key] || "Comum" }))}
                      title={!allowed ? `Tipo não permitido para ${CATEGORY_LABEL[category]}` : undefined}
                      onMouseEnter={(e) => {
                        if (!allowed) return;
                        e.currentTarget.style.filter = "brightness(1.15)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 6px 16px ${fin.glow}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = "";
                        e.currentTarget.style.transform = "";
                        e.currentTarget.style.boxShadow = active ? `0 4px 12px ${fin.glow}` : "";
                      }}
                      style={{
                        flex: 1,
                        minWidth: 54,
                        background: active ? fin.bg : "transparent",
                        border: `1px solid ${active ? fin.border : C.borderHi}`,
                        color: active ? fin.color : C.t3,
                        boxShadow: active ? `0 4px 12px ${fin.glow}` : "none",
                        borderRadius: 10,
                        padding: "10px 6px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: allowed ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                        transition: "all .18s",
                        opacity: allowed ? 1 : 0.35,
                      }}
                    >
                      {fin.label}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

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
            onClick={() => canSave && onSave({ status: sticker.status, rarity: sticker.rarity, duplicates: sticker.duplicates })}
            disabled={!canSave}
            title={!canSave ? "Mínimo 2 cópias para marcar como Repetida" : undefined}
            style={{
              flex: 2,
              background: canSave ? `linear-gradient(135deg,${C.amber},${C.amberLt})` : C.surface,
              border: canSave ? "none" : `1px solid ${C.borderHi}`,
              borderRadius: 12,
              padding: "12px",
              fontSize: 13,
              fontWeight: 800,
              color: canSave ? "#000" : C.t4,
              cursor: canSave ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              transition: "all .2s",
              opacity: canSave ? 1 : 0.5,
            }}
          >
            {!canSave ? "Mínimo 2×" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
