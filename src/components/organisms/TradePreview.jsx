import { useMemo } from "react";
import { C } from "@/styles/tokens.js";
import { decodeTradeLink, decodeTradeConfirm } from "@/utils/tradeLink.js";
import { buildEmptyDatabase } from "@/data/database.js";

export default function TradePreview({ tradeParam, onContinue }) {
  const { analysis, byCode } = useMemo(() => {
    const fullDb = buildEmptyDatabase();
    const map = Object.fromEntries(fullDb.map((s) => [s.code, s]));
    if (!tradeParam) return { analysis: null, byCode: map };
    try {
      // kind 0 = estado (repetidas + faltantes)
      const kind0 = decodeTradeLink(tradeParam, fullDb);
      if (kind0?.ok) return { analysis: { kind: 0, ...kind0 }, byCode: map };
      // kind 1 = confirmação de pares acordados
      const kind1 = decodeTradeConfirm(tradeParam, fullDb);
      if (kind1?.ok) return { analysis: { kind: 1, ...kind1 }, byCode: map };
    } catch {
      // payload malformado
    }
    return { analysis: null, byCode: map };
  }, [tradeParam]);

  // kind 0: theirRepetidas = o que eles oferecem; theirFaltantes = o que eles querem
  // kind 1: iReceive = o que eu recebo; iGive = o que eu dou
  let offered = [], wanted = [];
  if (analysis?.kind === 0) {
    offered = [...analysis.theirRepetidas].slice(0, 5);
    wanted  = [...analysis.theirFaltantes].slice(0, 5);
  } else if (analysis?.kind === 1) {
    offered = analysis.iReceive.slice(0, 5);
    wanted  = analysis.iGive.slice(0, 5);
  }

  if (!analysis) {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🔗</div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 8px", textAlign: "center" }}>
          Link de troca inválido
        </h2>
        <p style={{ color: C.t3, fontSize: 13, maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>
          Esse link pode ter expirado ou está corrompido. Mas você pode entrar no app e começar seu próprio álbum agora.
        </p>
        <button onClick={onContinue} style={ctaStyle}>Entrar no app</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 44, marginBottom: 4 }}>🤝</div>
      <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 4px", textAlign: "center" }}>
        Você recebeu uma troca!
      </h2>
      <p style={{ color: C.t2, fontSize: 13, margin: "0 0 24px", textAlign: "center", maxWidth: 320, lineHeight: 1.5 }}>
        Outro colecionador quer trocar com você. Veja a proposta abaixo.
      </p>

      <div style={{ width: "100%", maxWidth: 360, marginBottom: 20 }}>
        <PreviewCard title="Você recebe" accent={C.green} codes={offered} byCode={byCode} />
        <div style={{ height: 8 }} />
        <PreviewCard title="Você entrega" accent={C.amber} codes={wanted} byCode={byCode} />
      </div>

      <button onClick={onContinue} style={ctaStyle}>
        Aceitar troca →
      </button>
      <p style={{ color: C.t3, fontSize: 11, marginTop: 12, textAlign: "center", maxWidth: 320 }}>
        Crie sua conta em 30 segundos para ver a troca completa e aceitar.
      </p>
    </div>
  );
}

function PreviewCard({ title, accent, codes, byCode }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 12,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: accent, marginBottom: 8 }}>
        {title} ({codes.length})
      </div>
      {codes.length === 0 ? (
        <div style={{ fontSize: 12, color: C.t3 }}>—</div>
      ) : (
        codes.map((code) => {
          const s = byCode[code];
          return (
            <div key={code} style={{ fontSize: 12, color: "#fff", padding: "2px 0" }}>
              <b>{code}</b>{s ? ` · ${s.name}` : ""}
            </div>
          );
        })
      )}
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  background: "#0c0c1a",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  fontFamily: "'Sora','DM Sans',system-ui,sans-serif",
};

const ctaStyle = {
  background: "#f59e0b",
  color: "#0c0c1a",
  fontSize: 16,
  fontWeight: 800,
  padding: "14px 28px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
};
