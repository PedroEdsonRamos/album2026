import { useState } from "react";
import { ALL_TEAMS } from "@/data/teams.js";
import { teamInfo } from "@/utils/teamInfo.js";
import { getFinish } from "@/styles/finishes.js";
import { Icon } from "@/components/atoms/Icon.jsx";
import { C } from "@/styles/tokens.js";

export function Trades({ stickers, addToast, goToAlbum, setPage, setTeamFilter }) {
  const [collapsed, setCollapsed] = useState({});

  const dups = stickers.filter((s) => s.status === "Repetida");

  const ccDups = dups.filter((s) => s.team === "CC");
  const fwcDups = dups.filter((s) => s.team === "FWC");

  const byTeam = [
    ...ALL_TEAMS.map((t) => ({
      ...t,
      items: dups.filter((s) => s.team === t.id),
    })).filter((t) => t.items.length > 0),
    ...(fwcDups.length > 0 ? [{ ...teamInfo("FWC"), items: fwcDups }] : []),
    ...(ccDups.length > 0 ? [{ ...teamInfo("CC"), items: ccDups }] : []),
  ];

  const toggleCollapse = (teamId) => {
    setCollapsed((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const expandByType = (s) => {
    if (s.typeBreakdown && Object.keys(s.typeBreakdown).length > 0) {
      return Object.entries(s.typeBreakdown)
        .filter(([, qty]) => qty > 0)
        .map(([rarityKey, qty]) => ({
          sticker: { ...s, rarity: rarityKey },
          qty,
          fin: getFinish(rarityKey),
        }));
    }
    return [{ sticker: s, qty: s.duplicates, fin: getFinish(s.rarity) }];
  };

  const buildStickerLines = (items) => {
    const byCode = {};
    items.forEach((s) => {
      if (!byCode[s.code]) byCode[s.code] = { sticker: s, types: {} };
      if (s.typeBreakdown && Object.keys(s.typeBreakdown).length > 0) {
        Object.entries(s.typeBreakdown).forEach(([rarity, qty]) => {
          byCode[s.code].types[rarity] = (byCode[s.code].types[rarity] ?? 0) + qty;
        });
      } else {
        byCode[s.code].types[s.rarity] = s.duplicates;
      }
    });
    return Object.values(byCode)
      .map(({ sticker, types }) => {
        const typeLines = Object.entries(types)
          .filter(([, qty]) => qty > 0)
          .map(([rarity, qty]) => `Tipo: ${getFinish(rarity).label} (${qty}x)`)
          .join("\n");
        return `${sticker.code} — ${sticker.name} | ${sticker.position}\n${typeLines}`;
      })
      .join("\n\n");
  };

  const shareTeam = (t, items) => {
    const lines = buildStickerLines(items);
    const msg = `📒 *Figurinhas Disponíveis para Troca - Álbum Copa do Mundo FIFA 2026*\n\n${t.flag} *${t.name}*\n${lines}\n\n📲 Álbum FIFA World Cup 2026 · PTEC Solutions`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareSticker = (sticker, team) => {
    const lines = buildStickerLines([sticker]);
    const msg = `📒 *Figurinhas Disponíveis para Troca - Álbum Copa do Mundo FIFA 2026*\n\n${team.flag} *${team.name}*\n${lines}\n\n📲 Álbum FIFA World Cup 2026 · PTEC Solutions`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleShareAll = () => {
    const teamSections = byTeam.map((t) => {
      const lines = buildStickerLines(t.items);
      return `${t.flag} *${t.name}*\n${lines}`;
    });
    const msg = `📒 *Figurinhas Disponíveis para Troca - Álbum Copa do Mundo FIFA 2026*\n\n${teamSections.join("\n\n")}\n\n📲 Álbum FIFA World Cup 2026 · PTEC Solutions`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (!dups.length)
    return (
      <div style={{ minHeight: "calc(100vh - 160px)" }}>
        <div style={{ textAlign: "center", padding: "56px 24px", color: C.t3 }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: 18,
              background: C.surface, border: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Icon name="swap" size={32} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.t2 }}>Nenhuma figurinha repetida</div>
        </div>
      </div>
    );

  return (
    <div style={{ minHeight: "calc(100vh - 160px)" }}>
      <div
        style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Figurinhas para Troca</div>
          <div style={{ fontSize: 12, color: C.t3 }}>
            {dups.length} disponíveis em {byTeam.length} seleções
          </div>
        </div>
        <button
          onClick={handleShareAll}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: C.violetDim, border: `1px solid ${C.violet}55`,
            color: C.violet, borderRadius: 10, padding: "8px 14px",
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <Icon name="share" size={14} />
          Compartilhar
        </button>
      </div>

      {byTeam.map((t) => (
        <div key={t.id} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span
              style={{ fontSize: 20, cursor: "pointer" }}
              onClick={() => { setTeamFilter(t.id); setPage("stickers"); }}
            >{t.flag}</span>
            <span
              onClick={() => { setTeamFilter(t.id); setPage("stickers"); }}
              style={{ fontSize: 13, fontWeight: 700, color: "#fff", flex: 1, cursor: "pointer" }}
            >{t.name}</span>
            <span style={{ fontSize: 11, color: C.t3 }}>({t.items.length})</span>
            <button
              onClick={() => shareTeam(t, t.items)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: C.surface, border: `1px solid ${C.borderHi}`,
                color: C.t2, borderRadius: 8, padding: "4px 10px",
                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Icon name="share" size={12} /> Compartilhar
            </button>
            <button
              onClick={() => toggleCollapse(t.id)}
              style={{
                background: "none", border: "none", color: C.t3,
                cursor: "pointer", padding: 4, borderRadius: 6,
                display: "flex", alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 12, display: "inline-block", transition: "transform .2s",
                  transform: collapsed[t.id] ? "rotate(-90deg)" : "rotate(0deg)",
                }}
              >▼</span>
            </button>
          </div>

          {!collapsed[t.id] && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {t.items.flatMap((s) => expandByType(s)).map(({ sticker, qty, fin }, idx) => (
                <div
                  key={`${sticker.code}-${sticker.rarity}-${idx}`}
                  onClick={() => goToAlbum({ search: sticker.code })}
                  style={{
                    background: fin.bg, border: `1px solid ${fin.border}`,
                    borderRadius: 10, padding: "10px 12px",
                    display: "flex", alignItems: "center", gap: 10,
                    cursor: "pointer", WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{t.flag}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{sticker.name}</span>
                    <span style={{ fontSize: 11, color: C.t3 }}> · {sticker.code}</span>
                  </div>
                  <span
                    style={{
                      background: fin.bg, border: `1px solid ${fin.border}`,
                      color: fin.color, borderRadius: 999, padding: "1px 7px",
                      fontSize: 10, fontWeight: 700,
                    }}
                  >
                    {fin.label}
                  </span>
                  <span
                    style={{
                      background: C.violetDim, color: C.violet,
                      borderRadius: 999, padding: "2px 8px",
                      fontSize: 12, fontWeight: 700,
                    }}
                  >
                    ×{qty}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); shareSticker(sticker, t); }}
                    className="fc-btn"
                    title="Compartilhar no WhatsApp"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.35)",
                      color: "#25d366", borderRadius: 8, padding: "4px 7px",
                      cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    <Icon name="share" size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
