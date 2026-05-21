import { useState } from "react";
import { C } from "@/styles/tokens.js";

function parseCodes(inp) {
  return inp.split(/[\n,;]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
}

function ResultBox({ result }) {
  if (!result) return null;
  return (
    <div style={{ background: C.greenDim, border: `1px solid ${C.green}40`, borderRadius: 14, padding: "16px", marginTop: 14, animation: "fadeIn .4s" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 10 }}>✓ Processado!</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
        <div><div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>{result.added}</div><div style={{ fontSize: 10, color: C.t3 }}>Adicionadas</div></div>
        <div><div style={{ fontSize: 22, fontWeight: 900, color: C.violet }}>{result.dups}</div><div style={{ fontSize: 10, color: C.t3 }}>Repetidas</div></div>
        <div><div style={{ fontSize: 22, fontWeight: 900, color: C.red }}>{result.notFound}</div><div style={{ fontSize: 10, color: C.t3 }}>Inválidas</div></div>
      </div>
    </div>
  );
}

export function AddBatchPanel({ stickers, setStickers }) {
  const [batch, setBatch] = useState("");
  const [result, setResult] = useState(null);
  const [adding, setAdding] = useState(false);

  const handleBatch = () => {
    const codes = parseCodes(batch);
    if (!codes.length) return;
    setAdding(true);
    setTimeout(() => {
      let added = 0, dups = 0, notFound = 0;
      const upd = { ...Object.fromEntries(stickers.map((s) => [s.id, s])) };
      codes.forEach((c) => {
        const m = stickers.find((s) => s.code === c);
        if (!m) { notFound++; return; }
        if (m.status === "Tenho") { dups++; upd[m.id] = { ...upd[m.id], status: "Repetida", duplicates: (upd[m.id].duplicates||0)+1 }; }
        else { added++; upd[m.id] = { ...upd[m.id], status: "Tenho", addedAt: new Date().toISOString() }; }
      });
      setStickers((prev) => prev.map((s) => upd[s.id] || s));
      setResult({ added, dups, notFound });
      setBatch(""); setAdding(false);
    }, 500);
  };

  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        Códigos completos (um por linha ou vírgula)
      </label>
      <textarea value={batch} onChange={(e) => setBatch(e.target.value)} rows={7} placeholder={"BRA10\nARG5\nFWC3, ESP7"}
        style={{ width: "100%", background: C.surfaceHi, border: `1px solid ${C.borderHi}`, borderRadius: 12,
          padding: "14px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "monospace", resize: "vertical", lineHeight: 1.6 }} />
      <div style={{ fontSize: 11, color: C.t3, margin: "6px 0 14px" }}>
        {parseCodes(batch).length} código(s) detectado(s)
      </div>
      <button onClick={handleBatch} disabled={!batch.trim() || adding}
        style={{ width: "100%", background: batch.trim()?`linear-gradient(135deg,${C.amber},${C.amberLt})`:C.surface,
          border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 800,
          color: batch.trim()?"#000":C.t4, cursor: batch.trim()?"pointer":"default",
          fontFamily: "inherit", boxShadow: batch.trim()?`0 8px 24px ${C.amberGlow}`:"none" }}>
        {adding ? "Processando..." : "Importar Lote"}
      </button>
      <ResultBox result={result} />
    </div>
  );
}
