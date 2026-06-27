import { useState, useMemo } from "react";
import { ES_BY_CODE } from "@/data/extraStickers.js";
import {
  parseTraderCodes, computeTrade,
} from "@/utils/tradeMatcher.js";
import { C } from "@/styles/tokens.js";
import { TradeEditor } from "@/components/organisms/TradeEditor.jsx";

export function Trocador({ stickers, addToast, applyTrade }) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);
  const [parseInfo, setParseInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [applied, setApplied] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const validCodes = useMemo(() => new Set(stickers.map(s => s.code)), [stickers]);

  function handleProcess() {
    if (!raw.trim()) {
      addToast?.("Cole os códigos das repetidas do trocador primeiro.");
      return;
    }
    setApplied(false);
    setProcessing(true);
    setTimeout(() => {
      const parsed = parseTraderCodes(raw, validCodes);
      setParseInfo(parsed);
      if (parsed.valid.length === 0) {
        setResult(null);
        setProcessing(false);
        addToast?.("Nenhum código reconhecido. Verifique o texto colado.");
        return;
      }
      const r = computeTrade({ allStickers: stickers, traderCodes: parsed.valid, esByCode: ES_BY_CODE });
      setResult(r);
      setEditorKey(k => k + 1);
      setProcessing(false);
      requestAnimationFrame(() => {
        document.getElementById("trade-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, 30);
  }

  function handleReset() {
    setRaw(""); setResult(null); setParseInfo(null); setApplied(false);
  }

  function handleEditorConfirm({ entrego, recebo }) {
    applyTrade?.({ entrego, recebo });
    setRaw("");
    setResult(null);
    setParseInfo(null);
    setApplied(false);
    setEditorKey(k => k + 1);
    addToast?.("Troca concluída!");
  }

  const codeOf = (x) => (typeof x === "string" ? x : x && x.code);
  const sugGive = (result?.suggestedPairs || []).map((p) => codeOf(p.give)).filter(Boolean);
  const sugRecv = (result?.suggestedPairs || []).map((p) => codeOf(p.receive)).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", color: "#fff", paddingBottom: 80 }}>
      {/* Intro */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px" }}>Trocador inteligente</h2>
        <p style={{ fontSize: 13, color: C.t2, margin: 0, lineHeight: 1.5 }}>
          Cole a lista de repetidas do trocador (qualquer formato). O app sugere uma troca equilibrada.
        </p>
      </div>

      {/* Input */}
      <textarea
        value={raw}
        onChange={(e) => {
          const v = e.target.value;
          if (v.length > 20000) {
            addToast?.("Texto muito longo — cole apenas a lista de figurinhas.");
            setRaw(v.slice(0, 20000));
          } else setRaw(v);
        }}
        placeholder="Cole aqui a lista do trocador..."
        rows={4}
        style={{
          width: "100%", boxSizing: "border-box",
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "12px 14px",
          color: "#fff", fontSize: 16, fontFamily: "inherit",
          outline: "none", resize: "vertical", lineHeight: 1.6,
        }}
      />

      {parseInfo && (
        <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12 }}>
          <span style={{ color: C.green }}>{parseInfo.valid.length} reconhecidos</span>
          {parseInfo.invalid.length > 0 && (
            <span style={{ color: C.t3 }}>{parseInfo.invalid.length} não reconhecidos</span>
          )}
        </div>
      )}

      {/* Botões */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="button" onClick={handleProcess} disabled={processing}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 10, border: "none",
            background: processing ? "rgba(245,158,11,0.4)" : `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`,
            color: "#0c0c1a", fontWeight: 800, fontSize: 14,
            cursor: processing ? "default" : "pointer", fontFamily: "inherit",
          }}
        >{processing ? "Processando..." : "Calcular troca"}</button>
        {result && (
          <button type="button" onClick={handleReset} style={{
            padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.surface, color: C.t2, fontWeight: 700, fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
          }}>Limpar</button>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <div id="trade-result" style={{ marginTop: 24 }}>
          {applied ? (
            <div style={{ padding: 11, borderRadius: 10, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.12)", color: C.green, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
              ✓ Troca aplicada no seu álbum
              <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, marginTop: 4 }}>
                Envie a proposta pro trocador aplicar o lado dele.
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: C.t3, marginBottom: 8 }}>
                Monte a troca: toque pra incluir/excluir. Não precisa ser 1 por 1.
              </div>
              <TradeEditor
                key={editorKey}
                poolEntregar={result.pools?.entregar || []}
                poolReceber={result.pools?.receber || []}
                initialEntrego={sugGive}
                initialRecebo={sugRecv}
                confirmLabel="Confirmar troca no meu álbum"
                onConfirm={handleEditorConfirm}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
