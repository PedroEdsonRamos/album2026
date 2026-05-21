import { useInView } from "@/hooks/useInView.js";
import { RANK_BAR, C } from "@/styles/tokens.js";

export function StatusTeamRow({ team, pct, index }) {
  const [ref, vis] = useInView();
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateX(0)" : "translateX(-14px)",
        transition: `all .4s ${index * 0.04}s ease`,
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{team.flag}</span>
      <span
        style={{
          fontSize: 12,
          color: "#fff",
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {team.name}
      </span>
      <div
        style={{
          flex: 2,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 999,
          height: 5,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: vis ? `${pct}%` : "0%",
            background: RANK_BAR,
            borderRadius: 999,
            transition: "width 1s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.amber, width: 36, textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}
