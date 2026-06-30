import { useEffect, useMemo, useState } from "react";
import { C } from "@/styles/tokens.js";
import { computeLinkTrade } from "@/utils/tradeMatcher.js";
import {
  encodeTradeLink,
  decodeTradeLink,
  encodeTradeConfirm,
  decodeTradeConfirm,
} from "@/utils/tradeLink.js";
import { ES_BY_CODE } from "@/data/extraStickers.js";
import { TradeEditor } from "@/components/organisms/TradeEditor.jsx";

/* ===== helpers ===== */
function copyText(text, onOk) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(onOk).catch(() => fallbackCopy(text, onOk));
  } else {
    fallbackCopy(text, onOk);
  }
}
function fallbackCopy(text, onOk) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); onOk?.(); } catch { /* ignore */ }
  document.body.removeChild(ta);
}
function extractPayload(text) {
  const t = (text || "").trim();
  const m = t.match(/[?&]troca=([^&\s]+)/);
  return m ? decodeURIComponent(m[1]) : t;
}
function buildTradeUrl(payload) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/?troca=${payload}`;
}

/* ===== componente principal ===== */
export function TrocaPorLink({ stickers = [], applyTrade, addToast, incomingLink, isDemo, onBlockedAction }) {
  const [myLink, setMyLink] = useState("");
  const [inText, setInText] = useState("");
  const [analysis, setAnalysis] = useState(null); // {kind,...} | {error}
  const [applied, setApplied] = useState(false);
  const [confirmLink, setConfirmLink] = useState("");

  const counts = useMemo(() => {
    let rep = 0, fal = 0;
    for (const s of stickers) {
      if (s.status === "Repetida") rep++;
      else if (s.status === "Faltando") fal++;
    }
    return { rep, fal };
  }, [stickers]);

  // Pré-preenche e analisa quando a tela é aberta via link (?troca=...)
  useEffect(() => {
    if (!incomingLink) return;
    if (applied) return;            // não re-analisa depois que o usuário já aplicou
    setInText(incomingLink);
    handleAnalyze(incomingLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingLink, stickers]);     // re-roda quando a coleção carrega

  function handleGenerate() {
    if (!stickers.length) return;
    setMyLink(buildTradeUrl(encodeTradeLink(stickers)));
  }

  function handleAnalyze(textArg) {
    setApplied(false);
    setConfirmLink("");
    const payload = extractPayload(typeof textArg === "string" ? textArg : inText);
    if (!payload) { setAnalysis(null); addToast?.("Cole um link primeiro."); return; }

    const state = decodeTradeLink(payload, stickers);
    if (state.ok) {
      const result = computeLinkTrade({
        allStickers: stickers,
        theirRepetidas: state.theirRepetidas,
        theirFaltantes: state.theirFaltantes,
        esByCode: ES_BY_CODE,
      });
      setAnalysis({ kind: 0, result, payload });
      return;
    }
    const conf = decodeTradeConfirm(payload, stickers);
    if (conf.ok) {
      setAnalysis({ kind: 1, iGive: conf.iGive, iReceive: conf.iReceive });
      return;
    }
    const reason = state.reason === "version" || conf.reason === "version" ? "version" : "invalid";
    setAnalysis({ error: reason });
  }

  function handleClearInput() {
    setInText("");
    setAnalysis(null);
    setApplied(false);
    setConfirmLink("");
  }

  function handleConfirmFromLink({ entrego, recebo }) {
    applyTrade?.({ entrego, recebo });
    // codec trabalha por código; entrego pode vir como [{ code, rarity }] (passo B)
    const giveCodes = entrego.map((x) => (typeof x === "string" ? x : x.code));
    const payload = encodeTradeConfirm({ entrego: giveCodes, recebo }, stickers);
    setConfirmLink(buildTradeUrl(payload));
    setApplied(true);
    addToast?.("Álbum atualizado!");
  }

  function handleApplyConfirm() {
    if (analysis?.kind !== 1 || applied) return;
    applyTrade?.({ entrego: analysis.iGive, recebo: analysis.iReceive });
    setApplied(true);
    addToast?.("Álbum atualizado!");
  }

  const card = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 16 };
  const label = { fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 8 };
  const sub = { fontSize: 12, color: C.t3, marginBottom: 12, lineHeight: 1.5 };
  const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`, color: "#0c0c1a", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
  const codeBox = { fontSize: 11, color: C.t3, wordBreak: "break-all", background: "#0c0c1a", border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 10 };

  const codeOf = (x) => (typeof x === "string" ? x : x && x.code);
  const suggestedGive = (analysis?.result?.suggestedPairs || []).map((p) => codeOf(p.give)).filter(Boolean);
  const suggestedRecv = (analysis?.result?.suggestedPairs || []).map((p) => codeOf(p.receive)).filter(Boolean);

  return (
    <div>
      {/* Contadores sempre visíveis */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.amber }}>{counts.rep}</div>
          <div style={{ fontSize: 11, color: C.t3 }}>repetidas</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{counts.fal}</div>
          <div style={{ fontSize: 11, color: C.t3 }}>faltando</div>
        </div>
      </div>

      {/* Gerar meu link */}
      <div style={card}>
        <div style={label}>Gerar meu link</div>
        <div style={sub}>
          Cria um link com suas figurinhas <b style={{ color: C.amber }}>repetidas</b> e{" "}
          <b style={{ color: C.green }}>faltando</b>. O trocador abre no app dele e o app calcula a troca ideal dos dois lados.
        </div>
        {!myLink ? (
          <button type="button" onClick={handleGenerate} style={primaryBtn}>Gerar meu link de troca</button>
        ) : (
          <>
            <div style={codeBox}>{myLink}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={{ ...primaryBtn, flex: 1 }} onClick={() => copyText(myLink, () => addToast?.("Link copiado!"))}>Copiar link</button>
              <a href={`https://wa.me/?text=${encodeURIComponent("Bora trocar figurinhas? Abre meu link no app:\n" + myLink)}`} target="_blank" rel="noreferrer" style={{ padding: "10px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.amber, fontWeight: 700, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", fontFamily: "inherit" }}>WhatsApp</a>
            </div>
          </>
        )}
      </div>

      {/* Recebi um link */}
      <div style={card}>
        <div style={label}>Recebi um link</div>
        <div style={sub}>Cole o link que o trocador te mandou (de proposta ou de confirmação — o app reconhece sozinho).</div>
        <textarea
          value={inText}
          onChange={(e) => setInText(e.target.value)}
          placeholder="Cole aqui o link recebido…"
          rows={3}
          style={{ width: "100%", boxSizing: "border-box", background: "#0c0c1a", border: `1px solid ${C.border}`, borderRadius: 8, color: "#fff", fontSize: 16, padding: 10, fontFamily: "inherit", resize: "vertical", marginBottom: 10 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => handleAnalyze()} style={{ ...primaryBtn, flex: 1 }}>
            Analisar link
          </button>
          {inText ? (
            <button
              type="button"
              onClick={handleClearInput}
              style={{
                padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
                background: "transparent", color: C.t2, fontWeight: 700, fontSize: 13,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Limpar
            </button>
          ) : null}
        </div>

        {analysis?.error && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.12)", color: "#fca5a5", fontSize: 13, lineHeight: 1.5 }}>
            {analysis.error === "version"
              ? "Esse link é de uma versão diferente do álbum. Vocês dois precisam atualizar o app pra trocar."
              : "Link inválido ou incompleto. Confira se copiou o link inteiro."}
          </div>
        )}

        {analysis?.kind === 0 && analysis.result && (
          applied ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ padding: 11, borderRadius: 10, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.12)", color: C.green, fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>
                ✓ Baixa feita no seu álbum
                <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, marginTop: 4 }}>Envie a confirmação pro trocador dar baixa no álbum dele.</div>
              </div>
              <div style={{ background: `${C.amber}1a`, border: `1px solid ${C.amber}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: C.t2, fontWeight: 700, marginBottom: 4 }}>Falta o trocador confirmar!</div>
                <div style={{ fontSize: 12, color: C.t3 }}>
                  Sua coleção já foi atualizada. Envie este link para o trocador — ele precisa abrir e confirmar a troca no álbum dele também, senão só o seu álbum muda.
                </div>
              </div>
              <div style={codeBox}>{confirmLink}</div>
              <button type="button" onClick={() => copyText(confirmLink, () => addToast?.("Confirmação copiada!"))} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.amber, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Copiar link de confirmação</button>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: C.t3, marginBottom: 8 }}>
                Monte a troca: toque pra incluir/excluir. Não precisa ser 1 por 1.
              </div>
              <TradeEditor
                key={`${analysis.payload || "x"}:${analysis.result?.suggestedPairs?.length || 0}`}
                poolEntregar={analysis.result.pools?.entregar || []}
                poolReceber={analysis.result.pools?.receber || []}
                initialEntrego={suggestedGive}
                initialRecebo={suggestedRecv}
                confirmLabel="Confirmar e gerar link de volta"
                onConfirm={handleConfirmFromLink}
                isDemo={isDemo}
                onBlockedAction={onBlockedAction}
              />
            </div>
          )
        )}

        {analysis?.kind === 1 && (
          <div style={{ marginTop: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 800, color: C.t2, marginBottom: 8 }}>Troca combinada</div>
            {applied ? (
              <div style={{ padding: 11, borderRadius: 10, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.12)", color: C.green, fontSize: 13, fontWeight: 700, textAlign: "center" }}>✓ Troca concluída no seu álbum</div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: C.t3, marginBottom: 12 }}>
                  Você entrega <b style={{ color: C.amber }}>{analysis.iGive.length}</b> e recebe{" "}
                  <b style={{ color: C.green }}>{analysis.iReceive.length}</b>.
                </div>
                <button type="button" onClick={isDemo ? onBlockedAction : handleApplyConfirm} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "none", background: isDemo ? C.border : C.amber, color: isDemo ? C.t3 : "#0c0c1a", fontWeight: 800, fontSize: 15, cursor: isDemo ? "default" : "pointer", fontFamily: "inherit", opacity: isDemo ? 0.4 : 1 }}>
                  Aplicar troca
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
