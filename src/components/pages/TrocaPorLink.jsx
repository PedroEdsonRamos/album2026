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

/* ===== sub-componentes visuais ===== */
function Summary({ give, receive }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
      <div style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>+{receive}</div>
        <div style={{ fontSize: 11, color: C.t3 }}>você recebe</div>
      </div>
      <div style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.amber }}>−{give}</div>
        <div style={{ fontSize: 11, color: C.t3 }}>você dá</div>
      </div>
    </div>
  );
}
function PairList({ pairs }) {
  if (!pairs?.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {pairs.map((p) => (
        <div key={`${p.give.code}-${p.receive.code}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, background: "#0c0c1a", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
          <span title={p.give.name} style={{ color: C.amber, fontWeight: 700 }}>−{p.give.code}</span>
          <span style={{ color: C.t3 }}>→</span>
          <span title={p.receive.name} style={{ color: C.green, fontWeight: 700 }}>+{p.receive.code}</span>
        </div>
      ))}
    </div>
  );
}

/* ===== componente principal ===== */
export function TrocaPorLink({ stickers = [], applyTrade, addToast, incomingLink }) {
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
    if (incomingLink) {
      setInText(incomingLink);
      handleAnalyze(incomingLink);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingLink]);

  function handleGenerate() {
    if (!stickers.length) return;
    setMyLink(buildTradeUrl(encodeTradeLink(stickers)));
  }

  function handleAnalyze(textArg) {
    setApplied(false);
    setConfirmLink("");
    const payload = extractPayload(textArg ?? inText);
    if (!payload) { setAnalysis(null); addToast?.("Cole um link primeiro."); return; }

    const state = decodeTradeLink(payload, stickers);
    if (state.ok) {
      const result = computeLinkTrade({
        allStickers: stickers,
        theirRepetidas: state.theirRepetidas,
        theirFaltantes: state.theirFaltantes,
        esByCode: ES_BY_CODE,
      });
      setAnalysis({ kind: 0, result });
      return;
    }
    const conf = decodeTradeConfirm(payload, stickers);
    if (conf.ok) {
      setAnalysis({ kind: 1, theyGive: conf.theyGive, theyReceive: conf.theyReceive });
      return;
    }
    const reason = state.reason === "version" || conf.reason === "version" ? "version" : "invalid";
    setAnalysis({ error: reason });
  }

  function handleAcceptProposal() {
    const pairs = analysis?.result?.suggestedPairs ?? [];
    if (!pairs.length || applied) return;
    applyTrade?.(pairs);
    setApplied(true);
    setConfirmLink(buildTradeUrl(encodeTradeConfirm(pairs, stickers)));
    addToast?.("Álbum atualizado!");
  }

  function handleApplyConfirm() {
    if (analysis?.kind !== 1 || applied) return;
    const gives = [...(analysis.theyReceive ?? [])].map((code) => ({ give: { code } }));
    const recvs = [...(analysis.theyGive ?? [])].map((code) => ({ receive: { code } }));
    if (!gives.length && !recvs.length) return;
    applyTrade?.([...gives, ...recvs]);
    setApplied(true);
    addToast?.("Álbum atualizado!");
  }

  const card = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 16 };
  const label = { fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 8 };
  const sub = { fontSize: 12, color: C.t3, marginBottom: 12, lineHeight: 1.5 };
  const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`, color: "#0c0c1a", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
  const codeBox = { fontSize: 11, color: C.t3, wordBreak: "break-all", background: "#0c0c1a", border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 10 };

  return (
    <div>
      {/* Gerar meu link */}
      <div style={card}>
        <div style={label}>Gerar meu link</div>
        <div style={sub}>
          Cria um link com suas figurinhas <b style={{ color: C.amber }}>repetidas</b> ({counts.rep}) e{" "}
          <b style={{ color: C.green }}>faltando</b> ({counts.fal}). O trocador abre no app dele e o app calcula a troca ideal dos dois lados.
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
          style={{ width: "100%", boxSizing: "border-box", background: "#0c0c1a", border: `1px solid ${C.border}`, borderRadius: 8, color: "#fff", fontSize: 13, padding: 10, fontFamily: "inherit", resize: "vertical", marginBottom: 10 }}
        />
        <button type="button" onClick={handleAnalyze} style={primaryBtn}>Analisar link</button>

        {analysis?.error && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.12)", color: "#fca5a5", fontSize: 13, lineHeight: 1.5 }}>
            {analysis.error === "version"
              ? "Esse link é de uma versão diferente do álbum. Vocês dois precisam atualizar o app pra trocar."
              : "Link inválido ou incompleto. Confira se copiou o link inteiro."}
          </div>
        )}

        {analysis?.kind === 0 && (
          <div style={{ marginTop: 12 }}>
            <Summary give={analysis.result.summary.willGive} receive={analysis.result.summary.willReceive} />
            <PairList pairs={analysis.result.suggestedPairs} />
            {applied ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ padding: 11, borderRadius: 10, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.12)", color: C.green, fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>
                  ✓ Baixa feita no seu álbum
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, marginTop: 4 }}>Envie a confirmação pro trocador dar baixa no álbum dele.</div>
                </div>
                <div style={codeBox}>{confirmLink}</div>
                <button type="button" onClick={() => copyText(confirmLink, () => addToast?.("Confirmação copiada!"))} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.amber, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Copiar link de confirmação</button>
              </div>
            ) : analysis.result.suggestedPairs.length ? (
              <button type="button" onClick={handleAcceptProposal} style={{ ...primaryBtn, marginTop: 10 }}>Aceitar e dar baixa no meu álbum</button>
            ) : (
              <div style={{ ...sub, marginTop: 10, marginBottom: 0 }}>Nenhuma troca equilibrada com esse trocador no momento.</div>
            )}
          </div>
        )}

        {analysis?.kind === 1 && (
          <div style={{ marginTop: 12 }}>
            <Summary give={analysis.theyReceive.size} receive={analysis.theyGive.size} />
            {applied ? (
              <div style={{ padding: 11, borderRadius: 10, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.12)", color: C.green, fontSize: 13, fontWeight: 700, textAlign: "center" }}>✓ Troca concluída no seu álbum</div>
            ) : (
              <button type="button" onClick={handleApplyConfirm} style={{ ...primaryBtn, marginTop: 10 }}>Dar baixa no meu álbum</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
