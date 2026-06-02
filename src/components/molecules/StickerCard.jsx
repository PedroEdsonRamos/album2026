import { useState } from "react";
import { useInView } from "@/hooks/useInView.js";
import { teamInfo } from "@/utils/teamInfo.js";
import { getFinish } from "@/styles/finishes.js";
import { MY_CODES } from "@/data/userCollection.js";
import { Icon } from "@/components/atoms/Icon.jsx";
import { C } from "@/styles/tokens.js";

const RARITY_PRIORITY = ["Ouro", "Prata", "Bronze", "Lilás", "Metalizado", "Comum", "Coca-Cola"];
const getRarestRarity = (breakdown) => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  for (const r of RARITY_PRIORITY) {
    if (breakdown[r] && breakdown[r] > 0) return r;
  }
  return null;
};

const toRgba = (hex, alpha) => {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return `rgba(245,158,11,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export function StickerCard({ s, onToggle, onClick, delay = 0 }) {
  const [ref, vis] = useInView(0.05);
  const [touched, setTouched] = useState(false);
  const team = teamInfo(s.team);
  const displayRarity = getRarestRarity(s.typeBreakdown) ?? s.rarity;
  const fin = getFinish(displayRarity);
  const owned = s.status === "Tenho";
  const dup = s.status === "Repetida";
  const hasMultipleTypes = dup && s.typeBreakdown &&
    Object.keys(s.typeBreakdown).filter((k) => (s.typeBreakdown[k] ?? 0) > 0).length > 1;
  const totalDuplicates = s.typeBreakdown
    ? Object.values(s.typeBreakdown).reduce((a, b) => a + b, 0)
    : s.duplicates ?? 0;
  const isMine = MY_CODES.has(s.code);
  const clickable = !!(onToggle || onClick);

  // Compute display name and position label
  const isPlayer = s.team !== "FWC" && s.team !== "CC"
    && s.position !== "Escudo" && s.position !== "Foto Equipe" && s.position !== "Especial";
  const displayName = s.position === "Foto Equipe"
    ? `Seleção ${s.teamName} - ${s.number}`
    : s.team === "CC"
      ? `${s.name} - ${s.number}`
      : isPlayer
        ? `${s.name} - ${s.number}`
        : s.name;
  const positionLabel = s.country && s.year
    ? `${s.country} · ${s.year}`
    : s.position;
  const handleClick = () => {
    if (onToggle) onToggle(s.id);
    else if (onClick) onClick(s);
  };
  const handleTouch = () => {
    setTouched(true);
    setTimeout(() => setTouched(false), 300);
  };
  return (
    <div
      ref={ref}
      onClick={handleClick}
      onTouchStart={handleTouch}
      style={{
        background: owned
          ? `linear-gradient(135deg, ${fin.bg} 0%, ${toRgba(fin.color, 0.06)} 100%)`
          : dup
            ? "rgba(168,85,247,0.07)"
            : C.surface,
        border: owned
          ? `1px solid ${toRgba(fin.color, 0.55)}`
          : dup
            ? "1px solid rgba(168,85,247,0.28)"
            : `1px solid ${C.border}`,
        boxShadow: touched
          ? `0 0 0 2px ${toRgba(fin.color, 0.5)}, 0 6px 24px ${toRgba(fin.color, 0.35)}`
          : owned
            ? `0 0 0 1px ${toRgba(fin.color, 0.12)}, 0 4px 14px ${toRgba(fin.color, 0.16)}`
            : "none",
        borderRadius: 14,
        padding: "12px 11px",
        cursor: clickable ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
        opacity: vis ? 1 : 0,
        transform: vis ? (touched ? "scale(0.975)" : "scale(1)") : "scale(0.92)",
        transition: touched
          ? `opacity .35s ${delay}s, transform .08s ease, box-shadow .08s ease`
          : `opacity .35s ${delay}s, transform .35s ${delay}s, box-shadow .2s, border-color .2s`,
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
        e.currentTarget.style.boxShadow = owned
          ? `0 0 0 1px ${toRgba(fin.color, 0.12)}, 0 4px 14px ${toRgba(fin.color, 0.16)}`
          : "";
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
      {isMine && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: fin.color,
          }}
        />
      )}
      {dup && totalDuplicates > 0 && (
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 8,
            background: "rgba(168,85,247,0.18)",
            border: "1px solid rgba(168,85,247,0.35)",
            color: "#a855f7",
            borderRadius: 999,
            padding: "1px 7px",
            fontSize: 10,
            fontWeight: 700,
            zIndex: 1,
          }}
        >
          ×{totalDuplicates}
        </span>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginBottom: 7,
          position: "relative",
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
        }}
      >
        {displayName}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <span style={{ fontSize: 9, color: C.t3 }}>{positionLabel}</span>
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
          {fin.label}
          {dup && hasMultipleTypes && (s.typeBreakdown?.[displayRarity] ?? 0) > 0
            ? ` ×${s.typeBreakdown[displayRarity]}`
            : ""}
        </span>
      </div>
    </div>
  );
}
