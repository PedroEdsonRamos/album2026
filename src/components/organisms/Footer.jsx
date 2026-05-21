import { PTECLogo } from "@/components/atoms/PTECLogo.jsx";
import { C } from "@/styles/tokens.js";

export function Footer() {
  return (
    <div
      style={{
        background: "rgba(8,8,18,0.95)",
        backdropFilter: "blur(10px)",
        borderTop: `1px solid rgba(245,197,24,0.2)`,
        position: "relative",
        overflow: "visible",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "5px 80px 7px 16px",
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
        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}
      >
        <PTECLogo height={58} />
      </div>
    </div>
  );
}
