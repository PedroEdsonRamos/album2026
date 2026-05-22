import { PTECLogo } from "@/components/atoms/PTECLogo.jsx";
import { C } from "@/styles/tokens.js";

export function Footer() {
  return (
    <div
      style={{
        background: "rgba(8,8,18,0.95)",
        backdropFilter: "blur(10px)",
        borderTop: `1px solid rgba(245,197,24,0.2)`,
        position: "fixed",
        bottom: 64,
        left: 0,
        right: 0,
        zIndex: 10,
        maxWidth: 480,
        margin: "0 auto",
        overflow: "visible",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "5px 80px 15px 16px",
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: 8.5,
            color: C.t3,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Desenvolvido por
        </div>
        <div
          style={{
            fontSize: 8.5,
            color: C.t3,
            letterSpacing: "0.06em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          © 2026 PTEC SOLUTIONS · DIREITOS RESERVADOS
        </div>
      </div>
      <div
        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-60%)" }}
      >
        <PTECLogo height={58} />
      </div>
    </div>
  );
}
