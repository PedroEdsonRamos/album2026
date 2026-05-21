import { useState } from "react";
import { teamInfo } from "@/utils/teamInfo.js";
import { FINISH, getFinish } from "@/styles/finishes.js";
import { C } from "@/styles/tokens.js";

const FINISH_TO_RARITY = { Regular: "Normal", "Lilás": "Lilás", Bronze: "Bronze", Prata: "Prata", Ouro: "Gold" };

export function AddSinglePanel({ stickers, setStickers, addToast }) {
  const [code, setCode] = useState("");
  const [qty, setQty] = useState(1);
  const [asRep, setAsRep] = useState(false);
  const [userFinish, setUserFinish] = useState("Regular");
  const [obs, setObs] = useState("");
  const [adding, setAdding] = useState(false);

  const preview = stickers.find((s) => s.code.toUpperCase() === code.trim().toUpperCase());
  const previewTeam = preview && teamInfo(preview.team);

  const handleConfirm = () => {
    if (!preview) return;
    setAdding(true);
    setTimeout(() => {
      const newStatus = asRep ? "Repetida" : "Tenho";
      const newRarity = FINISH_TO_RARITY[userFinish] || "Normal";
      setStickers((prev) =>
        prev.map((s) =>
          s.id === preview.id
            ? { ...s, status: newStatus, rarity: newRarity,
                duplicates: newStatus === "Repetida" ? s.duplicates + qty : 0,
                obs: obs || s.obs, addedAt: new Date().toISOString() }
            : s
        )
      );
      addToast(`${preview.name} ${asRep ? "adicionada como repetida" : "coletada"}`, "success");
      setCode(""); setQty(1); setAsRep(false); setObs(""); setAdding(false);
    }, 400);
  };

  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        Código da Figurinha
      </label>
      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Ex: BRA10, FWC6..."
        style={{ width: "100%", background: C.surfaceHi, border: `1px solid ${C.borderHi}`, borderRadius: 12,
          padding: "14px 16px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
          fontFamily: "monospace", letterSpacing: "0.05em", marginBottom: 12 }} />

      {code.length >= 2 && !preview && (
        <div style={{ background: C.panelHi, border: `1px solid ${C.borderHi}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          {stickers.filter((s) => s.code.toUpperCase().startsWith(code.trim().toUpperCase())).slice(0, 5).map((s) => {
            const t = teamInfo(s.team); const fin = getFinish(s.rarity);
            return (
              <div key={s.id} onClick={() => setCode(s.code)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${C.border}` }}>
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
        <div style={{ background: previewTeam ? `linear-gradient(135deg,${previewTeam.color||C.amber}18,rgba(16,16,28,0.9))` : C.surface,
          border: `1px solid ${(previewTeam?.color||C.amber)}44`, borderRadius: 16, padding: "16px", marginBottom: 16, animation: "fadeIn 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 36 }}>{previewTeam?.flag || "🏆"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: C.t3 }}>{preview.code} · nº {preview.number}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{preview.name}</div>
              <div style={{ fontSize: 11, color: C.t2 }}>{preview.teamName} · {preview.position}</div>
            </div>
            <span style={{ background: preview.status==="Tenho"?C.greenDim:preview.status==="Repetida"?C.violetDim:C.redDim,
              color: preview.status==="Tenho"?C.green:preview.status==="Repetida"?C.violet:C.red,
              borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>
              {preview.status}
            </span>
          </div>
        </div>
      )}

      <label style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        Tipo da figurinha
      </label>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.entries(FINISH).map(([key, fin]) => (
          <button key={key} onClick={() => setUserFinish(key)} className="fc-btn"
            style={{ flex: 1, minWidth: 70, background: userFinish===key?fin.bg:C.surface,
              border: `1px solid ${userFinish===key?fin.border:C.borderHi}`,
              color: userFinish===key?fin.color:C.t2, borderRadius: 10, padding: "8px 4px",
              fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .18s" }}>
            {fin.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.t2, marginBottom: 6 }}>Quantidade</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}
              style={{ width: 38, height: 38, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, color: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", width: 30, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}
              style={{ width: 38, height: 38, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, color: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.t2, marginBottom: 6 }}>Status</div>
          <button onClick={() => setAsRep((r) => !r)}
            style={{ width: "100%", height: 38, background: asRep?C.violetDim:C.surface,
              border: `1px solid ${asRep?C.violet+"66":C.border}`, color: asRep?C.violet:C.t2,
              borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {asRep ? "Repetida" : "Nova"}
          </button>
        </div>
      </div>

      <label style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        Observações
      </label>
      <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Opcional..."
        style={{ width: "100%", background: C.surfaceHi, border: `1px solid ${C.borderHi}`, borderRadius: 10,
          padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
          fontFamily: "inherit", marginBottom: 16 }} />

      <button onClick={handleConfirm} disabled={!preview || adding}
        style={{ width: "100%", background: preview?`linear-gradient(135deg,${C.amber},${C.amberLt})`:C.surface,
          border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 800,
          color: preview?"#000":C.t4, cursor: preview?"pointer":"default", fontFamily: "inherit",
          boxShadow: preview?`0 8px 24px ${C.amberGlow}`:"none", transition: "all .3s" }}>
        {adding ? "Adicionando..." : "Confirmar Adição"}
      </button>
    </div>
  );
}
