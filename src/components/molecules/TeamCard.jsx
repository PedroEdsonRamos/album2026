import { useInView } from "@/hooks/useInView.js";
import { FINISH } from "@/styles/finishes.js";
import { toRgba } from "@/components/atoms/CardGlow.jsx";
import { RANK_BAR, C } from "@/styles/tokens.js";

const FINISH_TO_RARITY = { "Lilás": "Lilás", Bronze: "Bronze", Prata: "Prata", Ouro: "Ouro" };

export function TeamCard({ team, stickers, onSelect }) {
  const [ref, vis] = useInView();
  const ts = stickers.filter((s) => s.team === team.id);
  const owned = ts.filter((s) => s.status === "Tenho").length;
  const duplicates = ts.filter((s) => s.status === "Repetida").length;
  const missing = ts.length - owned;
  const pct = Math.round((owned / (ts.length || 1)) * 100);
  const teamColor = team.color ?? "#f59e0b";

  const rawCounts = {};
  ts.filter((s) => s.status === "Tenho" || s.status === "Repetida").forEach((s) => {
    if (s.typeBreakdown && Object.keys(s.typeBreakdown).length > 0) {
      Object.entries(s.typeBreakdown).forEach(([rarity, qty]) => {
        if (rarity !== "Normal") rawCounts[rarity] = (rawCounts[rarity] ?? 0) + qty;
      });
    } else if (s.rarity !== "Normal") {
      const total = s.status === "Repetida" ? s.duplicates : 1;
      rawCounts[s.rarity] = (rawCounts[s.rarity] ?? 0) + total;
    }
  });
  const legendCounts = Object.entries(FINISH)
    .filter(([k]) => k !== "Regular")
    .map(([key, fin]) => {
      const rarityKey = FINISH_TO_RARITY[key];
      const cnt = rawCounts[rarityKey] ?? 0;
      return cnt > 0 ? { key, fin, cnt } : null;
    })
    .filter(Boolean);
  return (
    <div
      ref={ref}
      onClick={onSelect}
      style={{
        background: C.surface,
        border: `1px solid ${toRgba(teamColor, 0.35)}`,
        boxShadow: `0 0 0 1px ${toRgba(teamColor, 0.12)}, 0 4px 16px ${toRgba(teamColor, 0.14)}`,
        borderRadius: 14,
        padding: "12px 14px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(16px)",
        transition: "opacity .4s ease, transform .4s ease, box-shadow .2s, border-color .2s",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 0 0 1px ${toRgba(teamColor, 0.22)}, 0 8px 24px ${toRgba(teamColor, 0.28)}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = `0 0 0 1px ${toRgba(teamColor, 0.12)}, 0 4px 16px ${toRgba(teamColor, 0.14)}`;
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 60% 50%, ${toRgba(teamColor, 0.08)} 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>
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
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
              marginLeft: "auto",
              flexShrink: 0,
            }}>
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
                    textAlign: "center",
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
          {duplicates > 0 && <span style={{ color: "#f59e0b" }}>· {duplicates} rep.</span>}
        </div>
      </div>
    </div>
  );
}
