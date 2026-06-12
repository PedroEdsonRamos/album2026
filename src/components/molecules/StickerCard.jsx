import { useState } from "react";
import { useInView } from "@/hooks/useInView.js";
import { teamInfo } from "@/utils/teamInfo.js";
import { FINISH, getFinish } from "@/styles/finishes.js";
import { MY_CODES } from "@/data/userCollection.js";
import { Icon } from "@/components/atoms/Icon.jsx";
import { C } from "@/styles/tokens.js";

const RARITY_PRIORITY = ["Ouro", "Prata", "Bronze", "Lilás", "Metalizado", "McDonalds", "Comum", "Coca-Cola"];
const BADGE_SAFE_ZONE = 76; // px reservados à direita para badges + margem
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

const FWC_SHORT_DESC = {
  "00": "Capa do Álbum",
  "FWC1": "Emblema", "FWC2": "Emblema",
  "FWC3": "Mascotes",
  "FWC4": "Slogan",
  "FWC5": "Bola",
  "FWC6": "Troféu",
  "FWC7": "País-Sede", "FWC8": "País-Sede",
};

function getCardLines(s) {
  const num = s.code === "00" ? "00" : s.number;
  if (s.position === "Foto Equipe") {
    return { number: num, desc: `Seleção ${s.teamName}`, footer: "Foto de Equipe" };
  }
  if (s.position === "Escudo") {
    return { number: num, desc: "Escudo", footer: "" };
  }
  if (s.team === "FWC" && s.country && s.year) {
    return { number: num, desc: `${s.year}\n${s.country}`, footer: "Momento Histórico" };
  }
  if (s.team === "FWC" || s.code === "00") {
    return { number: num, desc: FWC_SHORT_DESC[s.code] ?? s.name, footer: "Mascotes e Emblemas" };
  }
  if (s.team === "CC") {
    return { number: num, desc: s.name, footer: "Coca-Cola" };
  }
  // Default: Jogador
  return { number: num, desc: s.name, footer: s.position };
}

export function StickerCard({ s, onToggle, onClick, delay = 0 }) {
  const [ref, vis] = useInView(0.05);
  const [touched, setTouched] = useState(false);
  const team = teamInfo(s.team);
  const displayRarity = getRarestRarity(s.typeBreakdown) ?? s.rarity;
  const fin = getFinish(displayRarity);
  const owned = s.status === "Tenho";
  const dup = s.status === "Repetida";
  const totalDuplicates = s.typeBreakdown
    ? Object.values(s.typeBreakdown).reduce((a, b) => a + b, 0)
    : s.duplicates ?? 0;
  const isMine = MY_CODES.has(s.code);
  const clickable = !!(onToggle || onClick);
  const lines = getCardLines(s);

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
        background: owned || dup
          ? `linear-gradient(135deg, ${fin.bg} 0%, ${toRgba(fin.color, 0.06)} 100%)`
          : C.surface,
        border: owned || dup
          ? `1px solid ${toRgba(fin.color, 0.55)}`
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
      {dup && s.typeBreakdown && Object.keys(s.typeBreakdown).filter((k) => (s.typeBreakdown[k] ?? 0) > 0).length > 0 && (
        <div style={{
          position: "absolute",
          top: 6,
          right: 6,
          display: "grid",
          gridTemplateColumns: Object.values(s.typeBreakdown).filter((q) => q > 0).length > 2 ? "1fr 1fr" : "1fr",
          gap: 3,
          maxWidth: 70,
          zIndex: 1,
        }}>
          {Object.entries(s.typeBreakdown)
            .filter(([, qty]) => qty > 0)
            .sort(([typeA], [typeB]) => RARITY_PRIORITY.indexOf(typeA) - RARITY_PRIORITY.indexOf(typeB))
            .map(([type, qty]) => {
              const badgeFin = FINISH[type] ?? FINISH.Comum;
              return (
                <span key={type} style={{
                  background: badgeFin.bg,
                  border: `1px solid ${badgeFin.border}`,
                  color: badgeFin.color,
                  borderRadius: 8,
                  padding: "1px 6px",
                  fontSize: 9,
                  fontWeight: 700,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  lineHeight: "14px",
                }}>
                  {qty}x
                </span>
              );
            })}
        </div>
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
          marginBottom: 5,
          minHeight: 28,
          position: "relative",
        }}
      >
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, lineHeight: 1.2 }}>
          {lines.number}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: owned || dup ? C.t1 : C.t4,
          lineHeight: 1.2,
          maxWidth: `calc(100% - ${BADGE_SAFE_ZONE}px)`,
          wordBreak: "break-word",
          whiteSpace: "pre-line",
        }}>
          {lines.desc}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <span style={{
          fontSize: 9, color: C.t3,
          whiteSpace: s.team === "FWC" && s.country && s.year ? "pre-line" : undefined,
          lineHeight: s.team === "FWC" && s.country && s.year ? 1.2 : undefined,
        }}>
          {s.team === "FWC" && s.country && s.year ? "Momento\nHistórico" : lines.footer}
        </span>
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
        </span>
      </div>
    </div>
  );
}
