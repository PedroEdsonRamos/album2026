import { useState, useEffect } from "react";
import { teamInfo } from "@/utils/teamInfo.js";
import { FINISH, getFinish } from "@/styles/finishes.js";
import { getStickerCategory, CATEGORY_LABEL, isFixedType, getDefaultRarity, isTypeAllowed, STICKER_CATEGORY } from "@/utils/stickerTypes.js";
import { C } from "@/styles/tokens.js";

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

  const codeNorm = code.trim().toUpperCase().replace(/\s+/g, "");
  const preview = stickers.find((s) => s.code === codeNorm);
  const previewTeam = preview && teamInfo(preview.team);

  useEffect(() => { setAddTypeBreakdown({}); }, [code]);

  useEffect(() => {
    if (preview && !isTypeAllowed(preview, userFinish)) {
      setUserFinish(getDefaultRarity(preview));
    }
  }, [preview?.id]);

  const updateAddTypeBreakdown = (rarityKey, delta) => {
    setAddTypeBreakdown((prev) => {
      const newVal = Math.max(0, (prev[rarityKey] ?? 0) + delta);
      const updated = { ...prev };
      if (newVal === 0) delete updated[rarityKey];
      else updated[rarityKey] = newVal;
      return updated;
    });
  };

  const newStatus = preview ? determineStatus(preview.status, qty) : null;
  const addTotal = Object.values(addTypeBreakdown).reduce((a, b) => a + b, 0);
  const canAdd = preview && (newStatus !== "Repetida" || addTotal >= 2);

  const category = preview ? getStickerCategory(preview) : null;
  const isES = category === STICKER_CATEGORY.JOGADOR_ES;
  const fixedType = preview ? isFixedType(preview) : false;
  const defaultRarity = preview ? getDefaultRarity(preview) : "Comum";
  const defaultFin = FINISH[defaultRarity] ?? FINISH.Comum;
  const allowedBreakdownEntries = preview
    ? Object.entries(FINISH).filter(([key]) => isTypeAllowed(preview, key))
    : [];

  const handleSingle = () => {
    if (!preview || !canAdd) return;
    setAdding(true);
    setTimeout(() => {
      setStickers((prev) =>
        prev.map((s) => {
          if (s.id !== preview.id) return s;

          let typeBreakdown = s.typeBreakdown ? { ...s.typeBreakdown } : undefined;

          if (newStatus === "Repetida" && Object.keys(addTypeBreakdown).length > 0) {
            typeBreakdown = typeBreakdown ?? {};
            Object.entries(addTypeBreakdown).forEach(([rarity, q]) => {
              typeBreakdown[rarity] = (typeBreakdown[rarity] ?? 0) + q;
            });
          }

          const totalDuplicates = typeBreakdown
            ? Object.values(typeBreakdown).reduce((a, b) => a + b, 0)
            : 0;

          const rarestRarity = typeBreakdown
            ? RARITY_PRIORITY.find((r) => (typeBreakdown[r] ?? 0) > 0) ?? "Comum"
            : (userFinish ?? "Comum");

          return {
            ...s,
            status: newStatus,
            rarity: rarestRarity,
            duplicates: newStatus === "Repetida" ? totalDuplicates : 0,
            typeBreakdown: newStatus === "Repetida" ? typeBreakdown : undefined,
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
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Ex: BRA10, FWC6, CC1..."
        style={{
          width: "100%", background: C.surfaceHi, border: `1px solid ${C.borderHi}`,
          borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 15,
          outline: "none", boxSizing: "border-box", fontFamily: "monospace",
          letterSpacing: "0.05em", marginBottom: 12,
        }}
      />

      {code.length >= 2 && !preview && (
        <div style={{ background: C.panelHi, border: `1px solid ${C.borderHi}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          {stickers
            .filter((s) => s.code.startsWith(codeNorm))
            .slice(0, 5)
            .map((s) => {
              const t = teamInfo(s.team);
              const fin = getFinish(s.rarity);
              return (
                <div
                  key={s.id}
                  onClick={() => setCode(s.code)}
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
              <div style={{ fontSize: 9, fontFamily: "monospace", color: C.t3 }}>{preview.code} · nº {preview.number}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{preview.name}</div>
              <div style={{ fontSize: 11, color: C.t2 }}>{preview.teamName} · {preview.position}</div>
            </div>
            <span
              style={{
                background: preview.status === "Tenho" ? C.greenDim : preview.status === "Repetida" ? C.violetDim : C.redDim,
                color: preview.status === "Tenho" ? C.green : preview.status === "Repetida" ? C.violet : C.red,
                borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700,
              }}
            >
              {preview.status}
            </span>
          </div>
        </div>
      )}

      {/* Category badge */}
      {preview && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.borderHi}`, borderRadius: 10, padding: "8px 14px", marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: C.t3 }}>Tipo de figurinha:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isES ? "#a855f7" : C.t2 }}>
            {CATEGORY_LABEL[category]}
          </span>
          {fixedType && (
            <span style={{ fontSize: 10, color: C.t3, background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "2px 8px" }}>
              tipo fixo
            </span>
          )}
        </div>
      )}

      {/* Type selector — poka-yoke, when NOT Repetida and NOT fixed */}
      {preview && newStatus !== "Repetida" && !fixedType && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Tipo da figurinha
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(FINISH).map(([key, fin]) => {
              const allowed = isTypeAllowed(preview, key);
              const isSelected = userFinish === key;
              return (
                <button
                  key={key}
                  onClick={() => allowed && setUserFinish(key)}
                  disabled={!allowed}
                  title={!allowed ? `Não permitido para ${CATEGORY_LABEL[category]}` : ""}
                  style={{
                    background: isSelected ? fin.bg : allowed ? C.surface : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isSelected ? fin.border : allowed ? C.borderHi : "rgba(255,255,255,0.05)"}`,
                    color: isSelected ? fin.color : allowed ? C.t2 : C.t4,
                    borderRadius: 999, padding: "5px 14px",
                    fontSize: 11, fontWeight: 600,
                    cursor: allowed ? "pointer" : "not-allowed",
                    opacity: allowed ? 1 : 0.35,
                    fontFamily: "inherit", transition: "all .18s",
                  }}
                >
                  {fin.label}
                </button>
              );
            })}
          </div>
          {category === STICKER_CATEGORY.JOGADOR_COMUM && (
            <div style={{ fontSize: 10, color: C.t3, marginTop: 6 }}>
              ℹ️ Jogadores comuns só podem ser do tipo Comum. Apenas os 20 jogadores Extra Stickers podem ser Lilás, Bronze, Prata ou Ouro.
            </div>
          )}
          {isES && (
            <div style={{ fontSize: 10, color: "#a855f7", marginTop: 6 }}>
              ⭐ Jogador Extra Sticker — selecione o tipo da sua figurinha.
            </div>
          )}
        </div>
      )}

      {/* Fixed type display */}
      {preview && newStatus !== "Repetida" && fixedType && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Tipo da figurinha
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: defaultFin.bg, border: `1px solid ${defaultFin.border}`, borderRadius: 999, padding: "5px 14px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: defaultFin.color }}>{defaultFin.label}</span>
            <span style={{ fontSize: 9, color: C.t3 }}>(automático)</span>
          </div>
          <div style={{ fontSize: 10, color: C.t3, marginTop: 6 }}>
            🔒 O tipo desta figurinha é definido automaticamente pelo álbum.
          </div>
        </div>
      )}

      {/* Quantidade por tipo — só quando vai ser Repetida */}
      {preview && newStatus === "Repetida" && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
            Quantidade por tipo
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {allowedBreakdownEntries.map(([finishKey, fin]) => {
              const existingQty = preview.typeBreakdown?.[finishKey] ?? 0;
              const addingQty = addTypeBreakdown[finishKey] ?? 0;
              return (
                <div key={finishKey} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ background: fin.bg, border: `1px solid ${fin.border}`, color: fin.color, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, width: 72, textAlign: "center", flexShrink: 0 }}>
                    {fin.label}
                  </span>
                  <button onClick={() => updateAddTypeBreakdown(finishKey, -1)} style={{ width: 32, height: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>−</button>
                  <span style={{ width: 28, textAlign: "center", fontSize: 15, fontWeight: 700, color: addingQty > 0 ? "#fff" : C.t4 }}>{addingQty}</span>
                  <button onClick={() => updateAddTypeBreakdown(finishKey, +1)} style={{ width: 32, height: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>+</button>
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

      {preview && newStatus !== "Repetida" && (
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
        onChange={(e) => setObs(e.target.value)}
        placeholder="Opcional..."
        style={{
          width: "100%", background: C.surfaceHi, border: `1px solid ${C.borderHi}`,
          borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13,
          outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 16,
        }}
      />

      {preview && newStatus === "Repetida" && addTotal < 2 && (
        <div style={{ fontSize: 11, color: C.amber, textAlign: "center", marginBottom: 8, padding: "6px 10px", background: C.amberDim, borderRadius: 8 }}>
          ⚠️ Selecione ao menos 2 figurinhas para lançar como repetida
        </div>
      )}

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
