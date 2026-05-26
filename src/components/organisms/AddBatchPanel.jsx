import { useState, useMemo } from "react";
import { C } from "@/styles/tokens.js";
import { getStickerCategory, getDefaultRarity, STICKER_CATEGORY } from "@/utils/stickerTypes.js";

const SUFFIX_TO_RARITY = { L: "Lilás", B: "Bronze", P: "Prata", O: "Ouro" };

function parseBatchInput(input, allStickers) {
  const tokens = input.trim().split(/[\s,;\n]+/).filter(Boolean);
  const results = [], errors = [];
  tokens.forEach((token) => {
    const parts = token.toUpperCase().split(":");
    const code = parts[0].replace(/\s/g, "");
    const suffix = parts[1];
    const sticker = allStickers.find((s) => s.code === code);
    if (!sticker) { errors.push({ token, reason: `Código "${code}" não encontrado` }); return; }
    const category = getStickerCategory(sticker);
    if (suffix) {
      if (category !== STICKER_CATEGORY.JOGADOR_ES) {
        errors.push({ token, reason: `"${code}" não é Extra Sticker — sufixo :${suffix} não permitido` }); return;
      }
      if (!SUFFIX_TO_RARITY[suffix]) {
        errors.push({ token, reason: `Sufixo ":${suffix}" inválido. Use :L, :B, :P ou :O` }); return;
      }
    }
    results.push({ sticker, rarity: suffix ? SUFFIX_TO_RARITY[suffix] : getDefaultRarity(sticker) });
  });
  return { results, errors };
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

  const parsed = useMemo(() => parseBatchInput(batch, stickers), [batch, stickers]);
  const hasErrors = parsed.errors.length > 0;
  const hasInput = batch.trim().length > 0;
  const canSubmit = hasInput && !hasErrors && parsed.results.length > 0;

  const handleBatch = () => {
    if (!canSubmit) return;
    setAdding(true);
    setTimeout(() => {
      let added = 0, dups = 0, notFound = 0;
      const upd = { ...Object.fromEntries(stickers.map((s) => [s.id, s])) };
      parsed.results.forEach(({ sticker, rarity }) => {
        const m = upd[sticker.id];
        if (!m) { notFound++; return; }
        if (m.status === "Tenho") {
          dups++;
          const breakdown = { ...(m.typeBreakdown ?? {}), [rarity]: (m.typeBreakdown?.[rarity] ?? 0) + 1 };
          const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
          upd[m.id] = { ...m, status: "Repetida", duplicates: total, typeBreakdown: breakdown };
        } else {
          added++;
          upd[m.id] = { ...m, status: "Tenho", rarity, addedAt: new Date().toISOString() };
        }
      });
      setStickers((prev) => prev.map((s) => upd[s.id] || s));
      setResult({ added, dups, notFound });
      setBatch("");
      setAdding(false);
    }, 500);
  };

  return (
    <div>
      <div style={{ background: C.amberDim, border: `1px solid ${C.amber}44`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.amber, marginBottom: 8 }}>📋 Como usar o lote livre</div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: C.t2, lineHeight: 1.7 }}>
          <li>Digite os códigos completos, um por linha ou separados por vírgula</li>
          <li>O tipo é definido automaticamente conforme a categoria da figurinha</li>
          <li>Para Extra Stickers, adicione sufixo: <strong style={{ color: C.t1, fontFamily: "monospace" }}>ARG17:L</strong> (Lilás), <strong style={{ color: C.t1, fontFamily: "monospace" }}>ARG17:B</strong> (Bronze), <strong style={{ color: C.t1, fontFamily: "monospace" }}>ARG17:P</strong> (Prata), <strong style={{ color: C.t1, fontFamily: "monospace" }}>ARG17:O</strong> (Ouro)</li>
        </ol>
        <div style={{ marginTop: 8, fontSize: 11, color: C.t2, fontFamily: "monospace" }}>
          Ex: BRA10, ARG17:O, FWC3, ESP1
        </div>
      </div>

      <label style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        Códigos completos
      </label>
      <textarea
        value={batch}
        onChange={(e) => { setBatch(e.target.value); setResult(null); }}
        rows={7}
        placeholder={"BRA10\nARG17:O\nFWC3, ESP7"}
        style={{ width: "100%", background: C.surfaceHi, border: `1px solid ${hasErrors && hasInput ? C.red + "88" : C.borderHi}`, borderRadius: 12,
          padding: "14px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "monospace", resize: "vertical", lineHeight: 1.6 }}
      />

      <div style={{ fontSize: 11, color: C.t3, margin: "6px 0" }}>
        {parsed.results.length} código(s) válido(s) detectado(s)
      </div>

      {hasInput && hasErrors && (
        <div style={{ background: "rgba(244,0,9,0.1)", border: `1px solid ${C.red}44`, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 6 }}>⚠️ Erros encontrados — corrija antes de importar</div>
          {parsed.errors.map((e, i) => (
            <div key={i} style={{ fontSize: 11, color: C.t2, marginBottom: 2 }}>
              <span style={{ fontFamily: "monospace", color: C.red }}>{e.token}</span> — {e.reason}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleBatch}
        disabled={!canSubmit || adding}
        style={{ width: "100%", background: canSubmit ? `linear-gradient(135deg,${C.amber},${C.amberLt})` : C.surface,
          border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 800,
          color: canSubmit ? "#000" : C.t4, cursor: canSubmit ? "pointer" : "default",
          fontFamily: "inherit", boxShadow: canSubmit ? `0 8px 24px ${C.amberGlow}` : "none",
          marginBottom: 0 }}
      >
        {adding ? "Processando..." : "Importar Lote"}
      </button>

      <ResultBox result={result} />
    </div>
  );
}
