import { useState } from "react";
import { useInView } from "@/hooks/useInView.js";
import { useCounter } from "@/hooks/useCounter.js";
import { TEAMS, ALL_TEAMS } from "@/data/teams.js";
import { TOTAL_OFFICIAL } from "@/data/fwc.js";
import { FULL_DB } from "@/data/database.js";
import { CircleProgress } from "@/components/atoms/CircleProgress.jsx";
import { StatMiniBox } from "@/components/molecules/StatMiniBox.jsx";
import { CategoryBar } from "@/components/molecules/CategoryBar.jsx";
import { StatusTeamRow } from "@/components/molecules/StatusTeamRow.jsx";
import { ResetModal } from "@/components/organisms/ResetModal.jsx";
import { C } from "@/styles/tokens.js";

export function Status({ stickers, setStickers, addToast, setPage }) {
  const [showReset, setShowReset] = useState(false);
  const total = TOTAL_OFFICIAL;
  const owned = stickers.filter((s) => s.status === "Tenho").length;
  const missing = total - owned;
  const dups = stickers.filter((s) => s.status === "Repetida").length;
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
  const catData = [
    {
      label: "Jogadores",
      icon: "⚽",
      total: 864,
      owned: stickers.filter(
        (s) =>
          mainIds.has(s.team) && s.position !== "Escudo" && s.position !== "Foto Equipe" && s.status === "Tenho"
      ).length,
    },
    {
      label: "Fotos de Equipe",
      icon: "📸",
      total: 48,
      owned: stickers.filter(
        (s) => mainIds.has(s.team) && s.position === "Foto Equipe" && s.status === "Tenho"
      ).length,
    },
    {
      label: "Escudos",
      icon: "🛡️",
      total: 48,
      owned: stickers.filter(
        (s) => mainIds.has(s.team) && s.position === "Escudo" && s.status === "Tenho"
      ).length,
    },
    {
      label: "Especiais FWC",
      icon: "🌐",
      total: 20,
      owned: stickers.filter((s) => s.team === "FWC" && s.status === "Tenho").length,
    },
    {
      label: "Coca-Cola",
      icon: "🥤",
      total: 14,
      owned: stickers.filter((s) => s.team === "CC" && s.status === "Tenho").length,
    },
  ];

  const teamDist = ALL_TEAMS.map((t) => {
    const ts = stickers.filter((s) => s.team === t.id);
    const o = ts.filter((s) => s.status === "Tenho").length;
    return { ...t, pct: Math.round((o / (ts.length || 1)) * 100) };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div>
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
          <CircleProgress value={pct} size={130} stroke={10} color={C.amber} />
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
            <span style={{ fontSize: 28, fontWeight: 900, color: C.amber }}>{pctA}%</span>
            <span style={{ fontSize: 10, color: C.t3 }}>Completo</span>
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.amber, marginTop: 4 }}>{level}</div>
        <div style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>
          {owned.toLocaleString("pt-BR")} de {total.toLocaleString("pt-BR")} figurinhas oficiais
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <StatMiniBox label="Coletadas" value={owned} color={C.green} />
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
        const collected = owned / total;
        const factor = collected > 0 ? 1 / (1 - collected * 0.7) : 1;
        const packsEstimate = Math.ceil((missing * factor) / STICKERS_PER_PACK);
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>~{packsEstimate.toLocaleString("pt-BR")} pacotes</div>
                <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>Estimativa considerando duplicatas</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.amber }}>{cost}</div>
                <div style={{ fontSize: 10, color: C.t3 }}>a R$ 7,00 por pacote</div>
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
          onConfirm={() => {
            setStickers(FULL_DB);
            localStorage.removeItem("album2026-stickers-v1");
            setShowReset(false);
            addToast("Álbum resetado. Todas as figurinhas foram removidas.", "info");
            setPage("dashboard");
          }}
        />
      )}
    </div>
  );
}
