import { PTECLogo } from "@/components/atoms/PTECLogo.jsx";
import { C } from "@/styles/tokens.js";

export function Footer() {
  return (
    <div
      style={{
        background: "transparent",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        overflow: "visible",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "10px 80px 20px 16px",
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
        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-59%)" }}
      >
        <PTECLogo height={58} />
      </div>
    </div>
  );
}
