import { useEffect, useRef } from "react";
import { C } from "@/styles/tokens.js";

const CONFETTI_COLORS = ["#1fc8d1", "#6d48a8", "#b8621b", "#cbd5e1", "#fbbf24", "#f59e0b"];

function ConfettiPiece({ i }) {
  const left = ((i * 37 + (i * i * 7) % 61) % 100);
  const delay = (i * 0.11) % 1.8;
  const dur = 2.4 + (i % 6) * 0.35;
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const size = 6 + (i % 4) * 3;
  return (
    <span
      style={{
        position: "absolute",
        left: `${left}%`,
        top: -12,
        width: size,
        height: Math.round(size * 0.55),
        background: color,
        borderRadius: 2,
        animation: `confettiFall ${dur}s ${delay}s infinite linear`,
      }}
    />
  );
}

export function CompletionModal({ completion, onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!completion) return;
    if (completion.type === "group") {
      timerRef.current = setTimeout(onClose, 5000);
    }
    return () => clearTimeout(timerRef.current);
  }, [completion]);

  if (!completion) return null;

  const isAlbum = completion.type === "album";

  return (
    <div
      onClick={isAlbum ? undefined : onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn .3s ease",
      }}
    >
      {isAlbum && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 32 }, (_, i) => (
            <ConfettiPiece key={i} i={i} />
          ))}
        </div>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(16,16,28,0.98)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${isAlbum ? C.amber + "66" : C.violet + "66"}`,
          borderRadius: 24,
          padding: "32px 28px",
          textAlign: "center",
          maxWidth: 340,
          width: "90%",
          position: "relative",
          boxShadow: `0 24px 80px ${isAlbum ? C.amber : C.violet}33`,
        }}
      >
        {isAlbum ? (
          <>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🏆</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.amber, marginBottom: 6 }}>
              Parabéns!
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Álbum 100% completo!
            </div>
            <div style={{ fontSize: 12, color: C.t3, marginBottom: 24 }}>
              Você completou todas as 980 figurinhas do Álbum Oficial Panini Copa do Mundo 2026!
            </div>
            <button
              onClick={onClose}
              className="fc-btn"
              style={{
                background: C.amberDim,
                border: `1px solid ${C.amber}66`,
                color: C.amber,
                borderRadius: 12,
                padding: "10px 28px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              🎉 Incrível!
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.violet, marginBottom: 12 }}>
              Grupo {completion.grp} completo!
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
              {completion.teams.map((t) => (
                <span key={t.id} style={{ fontSize: 30 }} title={t.name}>
                  {t.flag}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.t3, marginBottom: 20 }}>
              Todas as seleções do Grupo {completion.grp} coletadas!
            </div>
            <button
              onClick={onClose}
              className="fc-btn"
              style={{
                background: C.violetDim,
                border: `1px solid ${C.violet}66`,
                color: C.violet,
                borderRadius: 12,
                padding: "10px 28px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
