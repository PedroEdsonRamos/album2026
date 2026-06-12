import { C } from "@/styles/tokens.js";

export function Jogos() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 16,
        padding: "40px 24px",
      }}
    >
      <div style={{ fontSize: 64 }}>⚽</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", textAlign: "center" }}>
        Em breve
      </div>
      <div
        style={{
          fontSize: 14,
          color: C.t3,
          textAlign: "center",
          maxWidth: 280,
          lineHeight: 1.6,
        }}
      >
        A aba de Jogos está sendo preparada.
      </div>
    </div>
  );
}
