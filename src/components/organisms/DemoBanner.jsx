import { forwardRef, useImperativeHandle, useState } from "react";
import { C } from "@/styles/tokens.js";

const DemoBanner = forwardRef(function DemoBanner({ onClick }, ref) {
  const [shaking, setShaking] = useState(false);

  useImperativeHandle(ref, () => ({
    shake: () => {
      setShaking(false);
      requestAnimationFrame(() => setShaking(true));
    },
  }));

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
        background: "rgba(28,28,46,0.98)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${C.amber}`,
        borderRadius: 14,
        padding: "12px 14px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>🔒</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>
            Modo demonstração
          </div>
          <div style={{ fontSize: 12, color: C.t3 }}>
            Finalize o pagamento para editar e salvar seu álbum.
          </div>
        </div>
        <span style={{ color: C.amber, fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
          Pagar →
        </span>
      </div>
    </div>
  );
});

export default DemoBanner;
