import { useInView } from "@/hooks/useInView.js";
import { FINISH, rarToFinish } from "@/styles/finishes.js";
import { RANK_BAR, C } from "@/styles/tokens.js";

export function TeamCard({ team, stickers, onSelect }) {
  const [ref, vis] = useInView();
  const ts = stickers.filter((s) => s.team === team.id);
  const owned = ts.filter((s) => s.status === "Tenho").length;
  const duplicates = ts.filter((s) => s.status === "Repetida").length;
  const missing = ts.length - owned;
  const pct = Math.round((owned / (ts.length || 1)) * 100);
  const legendCounts = Object.entries(FINISH)
    .filter(([k]) => k !== "Regular")
    .map(([key, fin]) => {
      const cnt = ts.filter(
        (s) =>
          (s.status === "Tenho" || s.status === "Repetida") &&
          rarToFinish(s.rarity) === key
      ).length;
      return cnt > 0 ? { key, fin, cnt } : null;
    })
    .filter(Boolean);
  return (
    <div
      ref={ref}
      onClick={onSelect}
      style={{
        background: `linear-gradient(135deg, ${team.color}18, rgba(16,16,28,0.85))`,
        border: `1px solid ${team.color}33`,
        borderRadius: 16,
        padding: "16px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(16px)",
        transition: "opacity .4s ease, transform .4s ease, box-shadow .2s",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px ${team.color}28`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -12,
          right: -2,
          fontSize: 44,
          fontWeight: 900,
          color: "rgba(255,255,255,0.05)",
          letterSpacing: "-0.05em",
          pointerEvents: "none",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {team.id}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 32 }}>{team.flag}</span>
        <span style={{ fontSize: 18, fontWeight: 900, color: pct === 100 ? C.green : "#fff" }}>
          {pct}%
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
          minHeight: 20,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{team.name}</span>
        {legendCounts.length > 0 && (
          <div style={{ display: "flex", gap: 3, marginLeft: "auto", flexShrink: 0 }}>
            {legendCounts.map(({ key, fin, cnt }) => (
              <span
                key={key}
                style={{
                  background: fin.bg,
                  border: `1px solid ${fin.border}`,
                  color: fin.color,
                  borderRadius: 6,
                  padding: "1px 5px",
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: "14px",
                }}
              >
                {cnt}
              </span>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: 999,
          height: 4,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: RANK_BAR,
            borderRadius: 999,
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
        <span style={{ color: C.green }}>✓ {owned}</span>
        <span style={{ color: C.red }}>· {missing} faltam</span>
        {duplicates > 0 && <span style={{ color: C.violet }}>· {duplicates} rep.</span>}
      </div>
    </div>
  );
}
