import { useInView } from "@/hooks/useInView.js";
import { RANK_BAR, C } from "@/styles/tokens.js";

export function CategoryBar({ label, icon, owned, total }) {
  const [ref, vis] = useInView();
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
  return (
    <div
      ref={ref}
      style={{
        marginBottom: 12,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(10px)",
        transition: "all .5s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: C.amber, fontWeight: 700 }}>{owned}</span>
          <span style={{ fontSize: 11, color: C.t3 }}>/ {total}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.amber, minWidth: 32, textAlign: "right" }}>
            {pct}%
          </span>
        </div>
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: 999,
          height: 7,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: vis ? `${pct}%` : "0%",
            background: RANK_BAR,
            borderRadius: 999,
            transition: "width 1.1s cubic-bezier(.4,0,.2,1)",
            boxShadow: `0 0 6px ${C.amberGlow}`,
          }}
        />
      </div>
    </div>
  );
}
