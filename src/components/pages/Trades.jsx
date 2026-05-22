import { ALL_TEAMS } from "@/data/teams.js";
import { getFinish } from "@/styles/finishes.js";
import { Icon } from "@/components/atoms/Icon.jsx";
import { C } from "@/styles/tokens.js";

export function Trades({ stickers, addToast }) {
  const dups = stickers.filter((s) => s.status === "Repetida");
  const byTeam = ALL_TEAMS.map((t) => ({
    ...t,
    items: dups.filter((s) => s.team === t.id),
  })).filter((t) => t.items.length > 0);

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

  const shareSticker = (sticker, team, qty) => {
    const fin = getFinish(sticker.rarity);
    const msg = `📒 *Figurinhas Disponíveis para Troca - Álbum Copa do Mundo FIFA 2026*\n\n${team.flag} *${team.name}*\n${sticker.code} — ${sticker.name}\nPosição: ${sticker.position}\nTipo: ${fin.label}\nQuantidade: ${qty}x\n\n📲 Álbum FIFA World Cup 2026 · PTEC Solutions`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleShare = () => {
    const lines = [`📒 *Figurinhas Disponíveis para Troca - Álbum Copa do Mundo FIFA 2026*`];
    byTeam.forEach((t) => {
      lines.push(`\n${t.flag} *${t.name}*`);
      t.items.flatMap((s) => expandByType(s)).forEach(({ sticker, qty, fin }) => {
        lines.push(`${sticker.code} — ${sticker.name}\nPosição: ${sticker.position}\nTipo: ${fin.label}\nQuantidade: ${qty}x`);
      });
    });
    lines.push(`\n📲 Álbum FIFA World Cup 2026 · PTEC Solutions`);
    navigator.clipboard?.writeText(lines.join("\n"));
    addToast("Lista copiada", "success");
  };

  if (!dups.length)
    return (
      <div style={{ textAlign: "center", padding: "56px 24px", color: C.t3 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: C.surface,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Icon name="swap" size={32} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.t2 }}>Nenhuma figurinha repetida</div>
      </div>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Figurinhas para Troca</div>
          <div style={{ fontSize: 12, color: C.t3 }}>
            {dups.length} disponíveis em {byTeam.length} seleções
          </div>
        </div>
        <button
          onClick={handleShare}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: C.violetDim,
            border: `1px solid ${C.violet}55`,
            color: C.violet,
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Icon name="share" size={14} />
          Compartilhar
        </button>
      </div>
      {byTeam.map((t) => (
        <div key={t.id} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{t.flag}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{t.name}</span>
            <span style={{ fontSize: 11, color: C.t3 }}>({t.items.length})</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {t.items.flatMap((s) => expandByType(s)).map(({ sticker, qty, fin }, idx) => (
              <div
                key={`${sticker.code}-${sticker.rarity}-${idx}`}
                style={{
                  background: fin.bg,
                  border: `1px solid ${fin.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>{t.flag}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{sticker.name}</span>
                  <span style={{ fontSize: 11, color: C.t3 }}> · {sticker.code}</span>
                </div>
                <span
                  style={{
                    background: fin.bg,
                    border: `1px solid ${fin.border}`,
                    color: fin.color,
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {fin.label}
                </span>
                <span
                  style={{
                    background: C.violetDim,
                    color: C.violet,
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ×{qty}
                </span>
                <button
                  onClick={() => shareSticker(sticker, t, qty)}
                  className="fc-btn"
                  title="Compartilhar no WhatsApp"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(37,211,102,0.15)",
                    border: "1px solid rgba(37,211,102,0.35)",
                    color: "#25d366",
                    borderRadius: 8,
                    padding: "4px 7px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="share" size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
