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

  const shareSticker = (s, team) => {
    const fin = getFinish(s.rarity);
    const msg = `🎴 *Figurinha para Troca — Álbum Copa 2026*\n\n${team.flag} *${team.name}*\nNº ${s.code} — ${s.name}\nPosição: ${s.position}\nTipo: ${fin.label}\n\n✅ Tenho ${s.duplicates}x para trocar\n📲 Álbum FIFA World Cup 2026 · PTEC Solutions`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `Figurinhas para troca – Copa 2026:\n\n${dups
        .map((s) => `${s.code} - ${s.name} (×${s.duplicates})`)
        .join("\n")}`
    );
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
            {t.items.map((s) => {
              const fin = getFinish(s.rarity);
              return (
                <div
                  key={s.id}
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
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{s.name}</span>
                    <span style={{ fontSize: 11, color: C.t3 }}> · {s.code}</span>
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
                    ×{s.duplicates}
                  </span>
                  <button
                    onClick={() => shareSticker(s, t)}
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
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
