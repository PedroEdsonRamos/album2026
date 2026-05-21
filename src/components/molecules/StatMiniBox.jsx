import { useInView } from "@/hooks/useInView.js";
import { useCounter } from "@/hooks/useCounter.js";
import { C } from "@/styles/tokens.js";

export function StatMiniBox({ label, value, color }) {
  const [ref, vis] = useInView();
  const n = useCounter(vis ? value : 0, 900);
  return (
    <div
      ref={ref}
      style={{
        textAlign: "center",
        background: C.surface,
        borderRadius: 12,
        padding: "12px 8px",
        border: `1px solid ${C.border}`,
        opacity: vis ? 1 : 0,
        transform: vis ? "scale(1)" : "scale(.88)",
        transition: "all .4s ease",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: "-.02em" }}>
        {n.toLocaleString("pt-BR")}
      </div>
      <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{label}</div>
    </div>
  );
}
