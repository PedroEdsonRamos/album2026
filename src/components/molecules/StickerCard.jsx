import { useInView } from "@/hooks/useInView.js";
import { teamInfo } from "@/utils/teamInfo.js";
import { getFinish } from "@/styles/finishes.js";
import { MY_CODES } from "@/data/userCollection.js";
import { Icon } from "@/components/atoms/Icon.jsx";
import { CardGlow } from "@/components/atoms/CardGlow.jsx";
import { C } from "@/styles/tokens.js";

const RARITY_PRIORITY = ["Ouro", "Prata", "Bronze", "Lilás", "Metalizado", "Comum", "Coca-Cola"];
const getRarestRarity = (breakdown) => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  for (const r of RARITY_PRIORITY) {
    if (breakdown[r] && breakdown[r] > 0) return r;
  }
  return null;
};

export function StickerCard({ s, onToggle, onClick, delay = 0 }) {
  const [ref, vis] = useInView(0.05);
  const team = teamInfo(s.team);
  const displayRarity = getRarestRarity(s.typeBreakdown) ?? s.rarity;
  const fin = getFinish(displayRarity);
  const owned = s.status === "Tenho";
  const dup = s.status === "Repetida";
  const totalCopies = s.typeBreakdown
    ? Object.values(s.typeBreakdown).reduce((a, b) => a + b, 0)
    : s.duplicates;
  const isMine = MY_CODES.has(s.code);
  const clickable = !!(onToggle || onClick);
  const handleClick = () => {
    if (onToggle) onToggle(s.id);
    else if (onClick) onClick(s);
  };
  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{
        background: owned || dup ? fin.bg : "rgba(12,12,26,0.7)",
        border: `1px solid ${owned ? fin.border : dup ? fin.color + "55" : C.border}`,
        borderRadius: 14,
        padding: "12px 11px",
        cursor: clickable ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
        opacity: vis ? 1 : 0,
        transform: vis ? "scale(1)" : "scale(0.92)",
        transition: `opacity .35s ${delay}s, transform .35s ${delay}s, box-shadow .2s, border-color .2s`,
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `0 8px 22px ${fin.glow}`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -14,
          right: -3,
          fontSize: 46,
          fontWeight: 900,
          color: "rgba(255,255,255,0.055)",
          letterSpacing: "-0.05em",
          pointerEvents: "none",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {s.team}
      </div>
      <CardGlow color={fin.color} showLine={owned} />
      {isMine && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: fin.color,
            zIndex: 3,
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginBottom: 7,
        }}
      >
        <span style={{ fontSize: 20 }}>{team.flag}</span>
        <span
          style={{
            fontSize: 10,
            color: owned ? fin.dimColor : C.t3,
            fontWeight: 600,
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {team.name}
        </span>
        {dup && s.typeBreakdown && Object.keys(s.typeBreakdown).length > 1 && (
          <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {Object.entries(s.typeBreakdown).map(([rarityKey, qty]) => {
              const f = getFinish(rarityKey);
              return (
                <span key={rarityKey} style={{ background: f.bg, border: `1px solid ${f.border}`, color: f.color, borderRadius: 6, padding: "1px 5px", fontSize: 9, fontWeight: 700, lineHeight: "14px" }}>
                  {f.label} ×{qty}
                </span>
              );
            })}
          </div>
        )}
        {dup && !(s.typeBreakdown && Object.keys(s.typeBreakdown).length > 1) && (
          <span
            style={{
              background: fin.bg,
              color: fin.color,
              borderRadius: 999,
              padding: "0 5px",
              fontSize: 10,
              fontWeight: 700,
              border: `1px solid ${fin.border}`,
            }}
          >
            ×{totalCopies}
          </span>
        )}
        {owned && (
          <span
            style={{
              background: C.greenDim,
              color: C.green,
              borderRadius: 10,
              padding: "1px 4px",
              fontSize: 10,
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={9} />
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: owned || dup ? C.t1 : C.t4,
          lineHeight: 1.25,
          marginBottom: 5,
          minHeight: 28,
          position: "relative",
          zIndex: 2,
        }}
      >
        {s.name}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 9, color: C.t3 }}>{s.position}</span>
        <span
          style={{
            background: fin.bg,
            border: `1px solid ${fin.border}`,
            color: fin.color,
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            flexShrink: 0,
            lineHeight: "16px",
            minWidth: 60,
            textAlign: "center",
          }}
        >
          {fin.label}{s.typeBreakdown?.[displayRarity] > 0 ? ` ×${s.typeBreakdown[displayRarity]}` : ""}
        </span>
      </div>
    </div>
  );
}
