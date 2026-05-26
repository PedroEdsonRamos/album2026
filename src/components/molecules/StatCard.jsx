import { useInView } from "@/hooks/useInView.js";
import { useCounter } from "@/hooks/useCounter.js";
import { Icon } from "@/components/atoms/Icon.jsx";
import { C } from "@/styles/tokens.js";

export function StatCard({ label, value, sub, icon, color, noGlow, onClick }) {
  const [ref, vis] = useInView();
  const n = useCounter(vis ? value : 0, 900);
  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: noGlow ? 14 : 16,
        padding: noGlow ? "12px 14px" : "18px 20px",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
        boxShadow: noGlow ? "none" : `0 4px 16px ${color}22`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(14px)",
        transition: "opacity .5s, transform .5s, background .2s",
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.background = C.surfaceHi)}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.background = C.surface)}
    >
      {!noGlow && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 70,
            height: 70,
            background: `radial-gradient(circle at top right, ${color}18, transparent)`,
          }}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: noGlow ? 4 : 8,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: noGlow ? 22 : 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
            {n.toLocaleString("pt-BR")}
          </div>
          {sub && <div style={{ fontSize: noGlow ? 10 : 11, color: noGlow ? C.t3 : color, marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{ color, opacity: 0.7 }}>
            <Icon name={icon} size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
