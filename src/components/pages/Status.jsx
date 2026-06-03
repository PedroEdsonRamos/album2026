import { useState } from "react";
import { useInView } from "@/hooks/useInView.js";
import { useCounter } from "@/hooks/useCounter.js";
import { TEAMS, ALL_TEAMS } from "@/data/teams.js";
import { TOTAL_OFFICIAL } from "@/data/fwc.js";
import { ES_RARITY_TYPES } from "@/data/extraStickers.js";
import { getESCollection, countESCollected } from "@/utils/esCollection.js";
import { getFinish } from "@/styles/finishes.js";
import { clearServiceWorkerCache } from "@/services/storage.js";
import { CircleProgress } from "@/components/atoms/CircleProgress.jsx";
import { StatMiniBox } from "@/components/molecules/StatMiniBox.jsx";
import { CategoryBar } from "@/components/molecules/CategoryBar.jsx";
import { StatusTeamRow } from "@/components/molecules/StatusTeamRow.jsx";
import { ResetModal } from "@/components/organisms/ResetModal.jsx";
import { C } from "@/styles/tokens.js";

export function Status({ stickers, setStickers, addToast, setPage, onReset }) {
  const [showReset, setShowReset] = useState(false);
  const [displayOwned, setDisplayOwned] = useState(null);
  const total = TOTAL_OFFICIAL;
  const isCollected = (s) => s.status === "Tenho" || s.status === "Repetida";
  const owned = stickers.filter(isCollected).length;
  const effectiveOwned = displayOwned ?? owned;
  const effectivePct = Math.round((effectiveOwned / total) * 100);
  const missing = total - owned;
  const dups = stickers
    .filter((s) => s.status === "Repetida")
    .reduce((acc, s) => acc + (s.duplicates ?? 0), 0);
  const pct = Math.round((owned / total) * 100);
  const [ref, vis] = useInView();
  const pctA = useCounter(vis ? pct : 0, 1200);
  const level =
    pct < 20
      ? "Iniciante"
      : pct < 40
      ? "Colecionador"
      : pct < 60
      ? "Veterano"
      : pct < 80
      ? "Expert"
      : pct < 100
      ? "Lendário"
      : "Campeão";

  const mainIds = new Set(TEAMS.map((t) => t.id));
  const esCollection = getESCollection(stickers);
  const esCount = countESCollected(stickers);
  const catData = [
    {
      label: "Jogadores",
      icon: "⚽",
      total: 864,
      owned: stickers.filter(
        (s) =>
          mainIds.has(s.team) && s.position !== "Escudo" && s.position !== "Foto Equipe" && isCollected(s)
      ).length,
    },
    {
      label: "Fotos de Equipe",
      icon: "📸",
      total: 48,
      owned: stickers.filter(
        (s) => mainIds.has(s.team) && s.position === "Foto Equipe" && isCollected(s)
      ).length,
    },
    {
      label: "Escudos",
      icon: "🛡️",
      total: 48,
      owned: stickers.filter(
        (s) => mainIds.has(s.team) && s.position === "Escudo" && isCollected(s)
      ).length,
    },
    {
      label: "Especiais FWC",
      icon: "🌐",
      total: 20,
      owned: stickers.filter((s) => s.team === "FWC" && isCollected(s)).length,
    },
    {
      label: "Coca-Cola",
      icon: "🥤",
      total: 14,
      owned: stickers.filter((s) => s.team === "CC" && isCollected(s)).length,
    },
  ];

  const teamDist = ALL_TEAMS.map((t) => {
    const ts = stickers.filter((s) => s.team === t.id);
    const o = ts.filter(isCollected).length;
    return { ...t, pct: Math.round((o / (ts.length || 1)) * 100) };
  }).sort((a, b) => b.pct - a.pct);

  const handleReset = async () => {
    setShowReset(false);
    const startOwned = owned;
    const STEPS = 30, DURATION = 800;
    await new Promise((resolve) => {
      let step = 0;
      const id = setInterval(() => {
        step++;
        const eased = 1 - Math.pow(1 - step / STEPS, 3);
        setDisplayOwned(Math.round(startOwned * (1 - eased)));
        if (step >= STEPS) {
          clearInterval(id);
          setDisplayOwned(0);
          resolve();
        }
      }, DURATION / STEPS);
    });
    await clearServiceWorkerCache();
    if (onReset) {
      await onReset();
    } else {
      setStickers((prev) => prev.map((s) => ({ ...s, status: "Faltando", duplicates: 0, addedAt: null, typeBreakdown: undefined, obs: undefined })));
    }
    setDisplayOwned(null);
    addToast("Álbum resetado. Todas as figurinhas foram removidas.", "info");
    setPage("dashboard");
  };

  return (
    <div style={{ minHeight: "calc(100vh - 160px)" }}>
      <div
        ref={ref}
        style={{
          background: "linear-gradient(135deg,rgba(245,158,11,0.1),rgba(168,85,247,0.05))",
          border: `1px solid ${C.amber}30`,
          borderRadius: 20,
          padding: "24px",
          marginBottom: 20,
          textAlign: "center",
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(16px)",
          transition: "all .6s",
        }}
      >
        <div style={{ display: "inline-flex", position: "relative", marginBottom: 8 }}>
          <CircleProgress value={displayOwned !== null ? 0 : pct} size={130} stroke={10} color={C.amber} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 900, color: C.amber }}>
              {displayOwned !== null ? effectivePct : pctA}%
            </span>
            <span style={{ fontSize: 10, color: C.t3 }}>Completo</span>
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.amber, marginTop: 4 }}>{level}</div>
        <div style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>
          {effectiveOwned.toLocaleString("pt-BR")} de {total.toLocaleString("pt-BR")} figurinhas oficiais
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <StatMiniBox label="Coletadas" value={effectiveOwned} color={C.green} />
        <StatMiniBox label="Faltando" value={missing} color={C.red} />
        <StatMiniBox label="Repetidas" value={dups} color={C.violet} />
      </div>

      {(() => {
        if (pct >= 100) {
          return (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.amber}44`,
                borderRadius: 16,
                padding: "16px 20px",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>🏆</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>Álbum completo!</div>
            </div>
          );
        }
        const STICKERS_PER_PACK = 7;
        const PACK_PRICE = 7.0;
        const packsEstimate = Math.ceil(missing / STICKERS_PER_PACK);
        const cost = (packsEstimate * PACK_PRICE).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        return (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.borderHi}`,
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              📦 Estimativa para completar
            </div>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 10 }}>
              Faltam {missing.toLocaleString("pt-BR")} figurinhas
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>~{packsEstimate.toLocaleString("pt-BR")} pacotes</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.amber }}>{cost}</div>
                <div style={{ fontSize: 10, color: C.t3 }}>R$ 7,00 por pacote (7 figurinhas)</div>
              </div>
            </div>
          </div>
        );
      })()}

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: "18px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.t2,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          📊 Por Categoria
        </div>
        {catData.map((cat) => (
          <CategoryBar
            key={cat.label}
            label={cat.label}
            icon={cat.icon}
            owned={cat.owned}
            total={cat.total}
          />
        ))}
      </div>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: "18px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.t2,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          🌍 Por Seleção
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {teamDist.slice(0, 18).map((t, i) => (
            <StatusTeamRow key={t.id} team={t} pct={t.pct} index={i} />
          ))}
        </div>
      </div>

      <div
        style={{
          background: C.surface,
          border: `1px solid rgba(109,72,168,0.3)`,
          borderRadius: 18,
          padding: "18px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          ⭐ Extra Stickers
        </div>
        <div style={{ fontSize: 11, color: C.t3, marginBottom: 12 }}>
          {esCount} de 80 versões coletadas
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          {ES_RARITY_TYPES.map((rarity) => {
            const fin = getFinish(rarity);
            return (
              <div key={rarity} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: fin.color, border: `1px solid ${fin.border}` }} />
                <span style={{ fontSize: 10, color: C.t3 }}>{fin.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 999, height: 5, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${Math.round((esCount / 80) * 100)}%`, background: "linear-gradient(90deg,#6d48a8,#a78bfa)", borderRadius: 999, transition: "width 1s" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {esCollection.map(({ player, collectedTypes }) => (
            <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>{player.flag}</span>
              <span style={{ fontSize: 12, color: Object.keys(collectedTypes).length > 0 ? "#fff" : C.t3, flex: 1, fontWeight: Object.keys(collectedTypes).length > 0 ? 600 : 400 }}>
                {player.name}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {ES_RARITY_TYPES.map((rarity) => {
                  const fin = getFinish(rarity);
                  const collected = (collectedTypes[rarity] ?? 0) > 0;
                  return (
                    <div key={rarity} style={{ width: 12, height: 12, borderRadius: "50%", background: collected ? fin.color : C.borderHi, border: `1px solid ${collected ? fin.border : C.border}`, boxShadow: collected ? `0 0 5px ${fin.glow}` : "none" }} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          padding: "16px",
          background: "rgba(248,113,113,0.06)",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.t3,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Zona de Perigo
        </div>
        <button
          onClick={() => setShowReset(true)}
          style={{
            width: "100%",
            background: "rgba(248,113,113,0.12)",
            border: "1px solid rgba(248,113,113,0.4)",
            color: C.red,
            borderRadius: 12,
            padding: "12px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .2s",
          }}
        >
          🗑️ Resetar Álbum
        </button>
      </div>

      {showReset && (
        <ResetModal
          ownedCount={owned}
          onClose={() => setShowReset(false)}
          onConfirm={handleReset}
        />
      )}
    </div>
  );
}
