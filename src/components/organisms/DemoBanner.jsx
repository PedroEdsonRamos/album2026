import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { C } from "@/styles/tokens.js";

const MESSAGES = [
  {
    icon: "🔒",
    title: "Seu álbum está congelado",
    sub: "Libere agora e comece a colar suas figurinhas.",
  },
  {
    icon: "⚽",
    title: "A Copa não espera",
    sub: "Cada jogo é uma figurinha nova pra registrar.",
  },
  {
    icon: "✨",
    title: "Menos que um café: R$ 7,00",
    sub: "Pagamento único. Acesso pra sempre.",
  },
];

const DemoBanner = forwardRef(function DemoBanner({ onClick }, ref) {
  const [shaking, setShaking] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    shake: () => {
      setShaking(false);
      requestAnimationFrame(() => setShaking(true));
    },
  }));

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const msg = MESSAGES[msgIndex];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      onAnimationEnd={() => setShaking(false)}
      style={{
        position: "fixed",
        left: 0, right: 0,
        bottom: "calc(64px + 8px)",
        zIndex: 1300,
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 12px",
        cursor: "pointer",
        animation: shaking ? "shake 0.35s ease" : "none",
      }}
    >
      <div style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(28,28,46,0.98) 60%)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${C.amber}`,
        borderRadius: 14,
        padding: "12px 14px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(245,158,11,0.1)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{ fontSize: 26, lineHeight: 1 }}>{msg.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 800, color: "#fff", fontSize: 14,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {msg.title}
          </div>
          <div style={{
            fontSize: 12, color: C.t2,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {msg.sub}
          </div>
        </div>
        <span style={{
          background: C.amber, color: "#0c0c1a",
          fontWeight: 800, fontSize: 13,
          padding: "8px 12px", borderRadius: 8,
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
        }}>
          Liberar
        </span>
      </div>
    </div>
  );
});

export default DemoBanner;
