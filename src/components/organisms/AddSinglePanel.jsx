import { useState, useEffect } from "react";
import { teamInfo } from "@/utils/teamInfo.js";
import { FINISH, getFinish } from "@/styles/finishes.js";
import { getStickerCategory, CATEGORY_LABEL, isFixedType, getDefaultRarity, STICKER_CATEGORY } from "@/utils/stickerTypes.js";
import { C } from "@/styles/tokens.js";
import { sanitizeCode, sanitizeObs } from "@/utils/sanitize.js";

const RARITY_PRIORITY = ["Ouro", "Prata", "Bronze", "Lilás", "Metalizado", "Comum", "Coca-Cola"];

const determineStatus = (currentStatus, qty) => {
  if (currentStatus === "Faltando" && qty === 1) return "Tenho";
  return "Repetida";
};

export function AddSinglePanel({ stickers, setStickers, addToast }) {
  const [code, setCode] = useState("");
  const [qty, setQty] = useState(1);
  const [userFinish, setUserFinish] = useState("Comum");
  const [addTypeBreakdown, setAddTypeBreakdown] = useState({});
  const [obs, setObs] = useState("");
  const [adding, setAdding] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const codeNorm = code.trim().toUpperCase().replace(/\s+/g, "");
  const preview = stickers.find((s) => s.code === codeNorm);
  const previewTeam = preview && teamInfo(preview.team);

  useEffect(() => { setAddTypeBreakdown({}); setQty(1); }, [code]);

  const category = preview ? getStickerCategory(preview) : null;
  const isES = category === STICKER_CATEGORY.JOGADOR_ES;
  const fixedType = preview ? isFixedType(preview) : false;
  const defaultRarity = preview ? getDefaultRarity(preview) : "Comum";
  const defaultFin = FINISH[defaultRarity] ?? FINISH.Comum;

  const addTotal = Object.values(addTypeBreakdown).reduce((a, b) => a + b, 0);
  const effectiveQty = isES ? addTotal : qty;
  const newStatus = preview ? determineStatus(preview.status, effectiveQty) : null;
  const canAdd = !!preview && (!isES || addTotal > 0);

  const updateAddTypeBreakdown = (rarityKey, delta) => {
    setAddTypeBreakdown((prev) => {
      const newVal = Math.max(0, (prev[rarityKey] ?? 0) + delta);
      const updated = { ...prev };
      if (newVal === 0) delete updated[rarityKey];
      else updated[rarityKey] = newVal;
      return updated;
    });
  };

  const handleClear = () => {
    if (!window.confirm("Deseja limpar o lançamento atual?")) return;
    setCode("");
    setQty(1);
    setObs("");
    setUserFinish("Comum");
    setAddTypeBreakdown({});
  };

  const handleSingle = () => {
    if (!preview || adding) return;
    setAdding(true);
    setTimeout(() => {
      setStickers((prev) =>
        prev.map((s) => {
          if (s.id !== preview.id) return s;

          let typeBreakdown = s.typeBreakdown ? { ...s.typeBreakdown } : undefined;

          if (isES && newStatus === "Repetida" && Object.keys(addTypeBreakdown).length > 0) {
            typeBreakdown = typeBreakdown ?? {};
            Object.entries(addTypeBreakdown).forEach(([rarity, q]) => {
              typeBreakdown[rarity] = (typeBreakdown[rarity] ?? 0) + q;
            });
          }

          const totalDuplicates =
            isES && typeBreakdown && Object.keys(typeBreakdown).length > 0
              ? Object.values(typeBreakdown).reduce((a, b) => a + b, 0)
              : qty;

          const rarestRarity =
            isES && Object.keys(addTypeBreakdown).length > 0
              ? RARITY_PRIORITY.find((r) => (addTypeBreakdown[r] ?? 0) > 0) ?? "Comum"
              : (userFinish !== "Comum" ? userFinish : defaultRarity);

          return {
            ...s,
            status: newStatus,
            rarity: rarestRarity,
            duplicates: newStatus === "Repetida" ? totalDuplicates : 0,
            typeBreakdown: newStatus === "Repetida" && isES ? typeBreakdown : undefined,
            obs: obs || s.obs,
            addedAt: new Date().toISOString(),
          };
        })
      );
      addToast(
        newStatus === "Tenho" ? "Figurinha coletada" : "Marcada como repetida",
        "success"
      );
      setCode("");
      setQty(1);
      setObs("");
      setAddTypeBreakdown({});
      setAdding(false);
    }, 400);
  };

  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        Código da Figurinha
      </label>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={code}
            onChange={(e) => setCode(sanitizeCode(e.target.value))}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Ex: BRA10, FWC6, CC1..."
            style={{
              flex: 1, background: C.surfaceHi, border: `1px solid ${C.borderHi}`,
              borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 16,
              outline: "none", boxSizing: "border-box", fontFamily: "monospace",
              letterSpacing: "0.05em",
            }}
          />
          {(code || qty > 1 || obs) && (
            <button
              onClick={handleClear}
              style={{
                background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
                color: "#f87171", borderRadius: 10, padding: "8px 14px",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              ✕ Limpar
            </button>
          )}
        </div>

        {code.length >= 2 && !preview && searchFocused && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            zIndex: 100, maxHeight: 280, overflowY: "auto", overflowX: "hidden",
            borderRadius: 12, border: `1px solid ${C.borderHi}`,
            background: C.panelHi, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}>
            {stickers
              .filter((s) => s.code.startsWith(codeNorm))
              .slice(0, 20)
              .map((s) => {
                const t = teamInfo(s.team);
                const fin = getFinish(s.rarity);
                return (
                  <div
                    key={s.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setCode(s.code); setSearchFocused(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${C.border}` }}
                  >
                    <span style={{ fontSize: 18 }}>{t.flag}</span>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: C.t3 }}>{s.code}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", flex: 1 }}>{s.name}</span>
                    <span style={{ background: fin.bg, border: `1px solid ${fin.border}`, color: fin.color, borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{fin.label}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {preview && (
        <div
          style={{
            background: previewTeam ? `linear-gradient(135deg,${previewTeam.color || C.amber}18,rgba(16,16,28,0.9))` : C.surface,
            border: `1px solid ${(previewTeam?.color || C.amber)}44`,
            borderRadius: 16, padding: "16px", marginBottom: 12, animation: "fadeIn 0.3s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 36 }}>{previewTeam?.flag || "🏆"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: C.t3 }}>{preview.code}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{preview.name}</div>
              <div style={{ fontSize: 11, color: C.t2 }}>{preview.teamName} · {preview.position}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              <span
                style={{
                  background: preview.status === "Tenho" ? C.greenDim : preview.status === "Repetida" ? C.violetDim : C.redDim,
                  color: preview.status === "Tenho" ? C.green : preview.status === "Repetida" ? C.violet : C.red,
                  borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700,
                }}
              >
                {preview.status}
              </span>
              {(preview.status === "Tenho" || preview.status === "Repetida") && (
                <span style={{ fontSize: 10, color: C.t3 }}>
                  já tem {preview.status === "Repetida" ? preview.duplicates : 1}×
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tipo da figurinha */}
      {preview && !isES && (() => {
        if (fixedType) {
          return (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                Tipo da figurinha
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: defaultFin.bg, border: `1px solid ${defaultFin.border}`, borderRadius: 999, padding: "4px 14px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: defaultFin.color }}>{defaultFin.label}</span>
              </div>
              <div style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>
                🔒 Tipo automático para esta categoria de figurinha.
              </div>
            </div>
          );
        }
        return (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              Tipo da figurinha
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: FINISH.Comum.bg, border: `1px solid ${FINISH.Comum.border}`, borderRadius: 999, padding: "4px 14px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: FINISH.Comum.color }}>Comum</span>
            </div>
          </div>
        );
      })()}

      {/* Quantidade por tipo — ES sempre */}
      {preview && isES && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            Quantidade por tipo
          </div>
          <div style={{ fontSize: 10, color: "#a855f7", marginBottom: 10 }}>
            ⭐ Jogador Extra Sticker — selecione quantas tem de cada tipo.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Comum", "Lilás", "Bronze", "Prata", "Ouro"].map((key) => {
              const fin = FINISH[key];
              const existingQty = preview.typeBreakdown?.[key] ?? 0;
              const addingQty = addTypeBreakdown[key] ?? 0;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ background: fin.bg, border: `1px solid ${fin.border}`, color: fin.color, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, width: 72, textAlign: "center", flexShrink: 0 }}>
                    {fin.label}
                  </span>
                  <button onClick={() => updateAddTypeBreakdown(key, -1)} style={{ width: 32, height: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>−</button>
                  <span style={{ width: 28, textAlign: "center", fontSize: 15, fontWeight: 700, color: addingQty > 0 ? "#fff" : C.t4 }}>{addingQty}</span>
                  <button onClick={() => updateAddTypeBreakdown(key, +1)} style={{ width: 32, height: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>+</button>
                  {existingQty > 0 && <span style={{ fontSize: 10, color: C.t3 }}>(já tem {existingQty})</span>}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: C.t3, marginTop: 8, textAlign: "right" }}>
            Total a adicionar: {addTotal}×
          </div>
        </div>
      )}

      {/* Quantidade simples — somente não-ES */}
      {preview && !isES && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.t2, marginBottom: 6 }}>Quantidade</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 38, height: 38, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, color: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", width: 30, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} style={{ width: 38, height: 38, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, color: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
          </div>
        </div>
      )}

      <label style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        Observações
      </label>
      <input
        value={obs}
        onChange={(e) => setObs(sanitizeObs(e.target.value))}
        placeholder="Opcional..."
        style={{
          width: "100%", background: C.surfaceHi, border: `1px solid ${C.borderHi}`,
          borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13,
          outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 16,
        }}
      />

      <button
        onClick={handleSingle}
        disabled={!canAdd || adding}
        style={{
          width: "100%",
          background: canAdd ? `linear-gradient(135deg,${C.amber},${C.amberLt})` : C.surface,
          border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 800,
          color: canAdd ? "#000" : C.t4, cursor: canAdd ? "pointer" : "default",
          fontFamily: "inherit", boxShadow: canAdd ? `0 8px 24px ${C.amberGlow}` : "none",
          transition: "all .3s",
        }}
      >
        {adding ? "Adicionando..." : "Confirmar Adição"}
      </button>
    </div>
  );
}
