import { useRef, useState } from "react";
import { FINISH, rarToFinish, getFinish } from "@/styles/finishes.js";
import { teamInfo } from "@/utils/teamInfo.js";
import { C } from "@/styles/tokens.js";
import { getStickerCategory, isFixedType, isTypeAllowed, getDefaultRarity, CATEGORY_LABEL } from "@/utils/stickerTypes.js";

const RARITY_MAP = {
  Comum: "Comum",
  "Lilás": "Lilás",
  Bronze: "Bronze",
  Prata: "Prata",
  Ouro: "Ouro",
  Metalizado: "Metalizado",
  "Coca-Cola": "Coca-Cola",
  McDonalds: "McDonalds",
};

const FINISH_TO_RARITY = {
  Comum: "Comum",
  "Lilás": "Lilás",
  Bronze: "Bronze",
  Prata: "Prata",
  Ouro: "Ouro",
  Metalizado: "Metalizado",
  "Coca-Cola": "Coca-Cola",
  McDonalds: "McDonalds",
};

const btnStyle = {
  width: 32, height: 32, background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 8, color: "#fff", fontSize: 18, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
};

export function StickerEditModal({ sticker, onChange, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const originalStatus = useRef(sticker.status).current;
  const et = teamInfo(sticker.team);
  const ef = getFinish(sticker.rarity);
  const category = getStickerCategory(sticker);
  const fixed = isFixedType(sticker);
  const totalBreakdown = Object.values(sticker.typeBreakdown ?? {}).reduce((a, b) => a + b, 0);
  const isRepetida = sticker.status === "Repetida";
  // Excedente >= 1 para salvar como Repetida
  const canSave = !isRepetida || (fixed ? (sticker.duplicates ?? 0) >= 1 : totalBreakdown >= 1);

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

  const fixedRarity = fixed ? getDefaultRarity(sticker) : null;
  const incFixed = () => onChange((p) => ({ ...p, duplicates: (p.duplicates ?? 0) + 1 }));
  const decFixed = () => onChange((p) => ({ ...p, duplicates: Math.max(0, (p.duplicates ?? 0) - 1) }));

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

        {/* Status */}
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
            const col = st === "Tenho" ? C.green : st === "Repetida" ? "#f59e0b" : C.red;
            return (
              <button
                key={st}
                onClick={() =>
                  onChange((p) => {
                    // Ao entrar em Repetida vindo de outro status: zera contador
                    if (st === "Repetida" && p.status !== "Repetida") {
                      return { ...p, status: "Repetida", duplicates: 0, typeBreakdown: undefined };
                    }
                    return {
                      ...p,
                      status: st,
                      duplicates: st !== "Repetida" ? 0 : (p.duplicates ?? 0),
                      typeBreakdown: st !== "Repetida" ? undefined : p.typeBreakdown,
                    };
                  })
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Tipo — sempre visível */}
        <div style={{ marginBottom: 16 }}>
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
            <>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: ef.bg,
                  border: `1px solid ${ef.border}`,
                  color: ef.color,
                  borderRadius: 999,
                  padding: "5px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  minWidth: 80,
                }}
              >
                {ef.label}
              </span>
              <div style={{ fontSize: 10, color: C.t3, marginTop: 6 }}>
                🔒 Tipo automático para {CATEGORY_LABEL[category]}.
              </div>
            </>
          ) : sticker.status !== "Repetida" ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(FINISH).filter(([key]) => isTypeAllowed(sticker, key)).map(([key, fin]) => {
                const active = rarToFinish(sticker.rarity) === key;
                return (
                  <button
                    key={key}
                    onClick={() => onChange((p) => ({ ...p, rarity: RARITY_MAP[key] || "Comum" }))}
                    onMouseEnter={(e) => {
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
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .18s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {fin.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: ef.bg,
                border: `1px solid ${ef.border}`,
                color: ef.color,
                borderRadius: 999,
                padding: "5px 16px",
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
                flexShrink: 0,
                minWidth: 80,
              }}
            >
              {ef.label}
            </span>
          )}
        </div>

        {/* Quantidade por tipo — Repetida + não fixo */}
        {sticker.status === "Repetida" && !fixed && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 11,
              color: "rgba(245,158,11,0.8)",
              marginBottom: 12,
              lineHeight: 1.5,
            }}>
              ⚠️ Lance apenas as cópias <strong>extras</strong> além da que está colada no álbum.
              A figurinha principal já está contabilizada.
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
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
                    <button onClick={() => updateTypeBreakdown(rarityKey, -1)} style={btnStyle}>−</button>
                    <span style={{ width: 28, textAlign: "center", fontSize: 15, fontWeight: 700, color: qty > 0 ? "#fff" : C.t4 }}>
                      {qty}
                    </span>
                    <button onClick={() => updateTypeBreakdown(rarityKey, +1)} style={btnStyle}>+</button>
                    {qty > 0 && (
                      <span style={{ fontSize: 11, color: C.t3 }}>{qty === 1 ? "1 cópia" : `${qty} cópias`}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: C.t3, marginTop: 10, textAlign: "right" }}>
              Total: {totalBreakdown}× repetidas
            </div>
          </div>
        )}

        {/* Quantidade simples — Repetida + fixo */}
        {sticker.status === "Repetida" && fixed && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 11,
              color: "rgba(245,158,11,0.8)",
              marginBottom: 12,
              lineHeight: 1.5,
            }}>
              ⚠️ Lance apenas as cópias <strong>extras</strong> além da que está colada no álbum.
              A figurinha principal já está contabilizada.
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              Quantidade extra
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={decFixed} style={btnStyle}>−</button>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", width: 30, textAlign: "center" }}>
                {sticker.duplicates ?? 0}
              </span>
              <button onClick={incFixed} style={btnStyle}>+</button>
            </div>
          </div>
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
            onClick={() => {
              if (!canSave || saving) return;
              setSaving(true);
              setTimeout(() => {
                onSave({ status: sticker.status, rarity: sticker.rarity, duplicates: sticker.duplicates });
                setSaving(false);
              }, 250);
            }}
            disabled={!canSave || saving}
            title={!canSave ? "Adicione ao menos 1 cópia extra para salvar como Repetida" : undefined}
            style={{
              flex: 2,
              background: canSave ? `linear-gradient(135deg,${C.amber},${C.amberLt})` : C.surface,
              border: canSave ? "none" : `1px solid ${C.borderHi}`,
              borderRadius: 12,
              padding: "12px",
              fontSize: 13,
              fontWeight: 800,
              color: canSave ? "#000" : C.t4,
              cursor: canSave && !saving ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              transition: "all .2s",
              opacity: canSave && !saving ? 1 : 0.5,
            }}
          >
            {!canSave ? "Adicione extras" : saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
