import { useState } from "react";
import { useInView } from "@/hooks/useInView.js";
import { useCounter } from "@/hooks/useCounter.js";
import { TEAMS } from "@/data/teams.js";
import { TOTAL_OFFICIAL } from "@/data/fwc.js";
import { getESCollection } from "@/utils/esCollection.js";
import { FINISH } from "@/styles/finishes.js";
import { CircleProgress } from "@/components/atoms/CircleProgress.jsx";
import { StatCard } from "@/components/molecules/StatCard.jsx";
import { StickerCard } from "@/components/molecules/StickerCard.jsx";
import { RANK_BAR, C } from "@/styles/tokens.js";

export function Dashboard({ stickers, setPage, setTeamFilter, goToAlbum }) {
  const total = TOTAL_OFFICIAL;
  const owned = stickers.filter((s) => s.status === "Tenho").length;
  const dups = stickers.filter((s) => s.status === "Repetida").length;
  const jogadoresOwned = stickers.filter((s) =>
    s.status === "Tenho" && s.team !== "FWC" && s.team !== "CC" &&
    s.position !== "Escudo" && s.position !== "Foto Equipe"
  ).length;
  const especiaisOwned = stickers.filter((s) =>
    s.status === "Tenho" && (s.team === "FWC" || s.team === "CC")
  ).length;
  const selecoesOwned = stickers.filter((s) =>
    s.status === "Tenho" && s.position === "Foto Equipe"
  ).length;
  const esCollection = getESCollection(stickers);
  const esLilas = esCollection.filter((e) => (e.collectedTypes["Lilás"] ?? 0) > 0).length;
  const esBronze = esCollection.filter((e) => (e.collectedTypes["Bronze"] ?? 0) > 0).length;
  const esPrata = esCollection.filter((e) => (e.collectedTypes["Prata"] ?? 0) > 0).length;
  const esOuro = esCollection.filter((e) => (e.collectedTypes["Ouro"] ?? 0) > 0).length;
  const pct = Math.round((owned / total) * 100);
  const [hRef, hVis] = useInView();
  const pctA = useCounter(hVis ? pct : 0, 1200);
  const [rankSort, setRankSort] = useState("pct");
  const [showAll, setShowAll] = useState(false);
  const teamStats = TEAMS.map((t) => {
    const ts = stickers.filter((s) => s.team === t.id);
    const o = ts.filter((s) => s.status === "Tenho").length;
    const legendCount = ts.filter((s) => s.rarity !== "Comum" && s.status === "Tenho").length;
    return { ...t, total: ts.length, owned: o, pct: Math.round((o / (ts.length || 1)) * 100), legendCount };
  });
  const sortedTeams = [...teamStats].sort((a, b) => {
    if (rankSort === "pct")  return b.pct - a.pct;
    if (rankSort === "name") return a.name.localeCompare(b.name, "pt-BR");
    return 0;
  });
  const visibleTeams = rankSort !== "pct" || showAll ? sortedTeams : sortedTeams.slice(0, 6);
  const recent = [...stickers]
    .filter((s) => s.status === "Tenho")
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 6);

  return (
    <div>
      <div
        ref={hRef}
        style={{
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(168,85,247,0.05) 50%, rgba(16,16,28,0) 100%)",
          borderRadius: 20,
          padding: "26px 22px",
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
          opacity: hVis ? 1 : 0,
          transform: hVis ? "translateY(0)" : "translateY(18px)",
          transition: "all .6s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: -6, opacity: 0.07 }}>
          <img src="/trophy_watermark.png" alt="" style={{ height: 168, width: "auto", objectFit: "contain", display: "block" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative" }}>
            <CircleProgress value={pct} size={92} stroke={7} color={C.amber} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 19, fontWeight: 900, color: C.amber }}>{pctA}%</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.t2, marginBottom: 4 }}>Álbum Oficial Panini</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
              Copa do Mundo
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                background: `linear-gradient(90deg,${C.amber},${C.amberLt})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              2026
            </div>
            <div style={{ fontSize: 12, color: C.t3, marginTop: 6 }}>
              {owned} de {total} figurinhas
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 999,
            height: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: RANK_BAR,
              borderRadius: 999,
              transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard
            label="Coletadas"
            value={owned}
            sub={`${pct}% do álbum`}
            icon="check"
            color={C.green}
            onClick={() => goToAlbum({ status: "Tenho" })}
          />
          <StatCard
            label="Repetidas"
            value={dups}
            sub="para troca"
            icon="swap"
            color={C.violet}
            onClick={() => setPage("trocas")}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          <StatCard label="Jogadores" value={jogadoresOwned} sub="incluídos Extra Stickers"
            icon={null} color="#1fc8d1" noGlow
            onClick={() => goToAlbum({ status: "Tenho" })} />
          <StatCard label="Seleções" value={selecoesOwned} sub="fotos equipe"
            icon={null} color={C.amber} noGlow
            onClick={() => goToAlbum({ position: "Foto Equipe" })} />
          <StatCard label="Especiais" value={especiaisOwned} sub="FWC + Coca-Cola"
            icon={null} color="#94a3b8" noGlow
            onClick={() => setPage("times")} />
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 8, marginTop: 4,
          padding: "6px 12px",
          background: "rgba(168,85,247,0.08)",
          border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: 10,
        }}>
          <span style={{ fontSize: 14 }}>⭐</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a855f7", flex: 1 }}>
            Extra Stickers — por tipo
          </span>
          <span style={{ fontSize: 10, color: C.t3 }}>
            {esLilas + esBronze + esPrata + esOuro} de 80 coletados
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 20 }}>
          {[
            { key: "Lilás",  count: esLilas },
            { key: "Bronze", count: esBronze },
            { key: "Prata",  count: esPrata },
            { key: "Ouro",   count: esOuro },
          ].map(({ key, count }) => {
            const fin = FINISH[key];
            return (
              <div
                key={key}
                onClick={() => goToAlbum({ position: "Extra Stickers", finish: key })}
                style={{
                  background: fin.bg,
                  border: `1px solid ${fin.border}`,
                  borderRadius: 14,
                  padding: "10px 12px",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                <div style={{ fontSize: 11, color: fin.dimColor, marginBottom: 4, fontWeight: 600 }}>{fin.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: fin.color }}>{count}</div>
                <div style={{ fontSize: 10, color: fin.dimColor, marginTop: 2 }}>/20</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.t2,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          🏆 Ranking das Seleções
        </div>
        <div style={{ overflowX: "auto", overflowY: "visible", paddingBottom: 4, marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 5, paddingTop: 5, width: "max-content", overflow: "visible" }}>
            {[
              { id: "pct",  label: "% Completo" },
              { id: "name", label: "Nome A-Z" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setRankSort(opt.id); setShowAll(false); }}
                className="fc-btn"
                style={{
                  background: rankSort === opt.id ? C.amberDim : C.surface,
                  border: `1px solid ${rankSort === opt.id ? C.amber + "66" : C.borderHi}`,
                  color: rankSort === opt.id ? C.amber : C.t2,
                  borderRadius: 999,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  flexShrink: 0,
                  transition: "all .18s ease",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visibleTeams.map((t, i) => (
            <div
              key={t.id}
              onClick={() => {
                setTeamFilter(t.id);
                setPage("stickers");
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.surfaceHi;
                e.currentTarget.style.borderColor = C.amber + "33";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.surface;
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "";
              }}
              style={{
                background: C.surface,
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                transition: "all .18s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: i < 3 ? C.amber : C.t3, width: 16 }}>
                #{i + 1}
              </span>
              <span style={{ fontSize: 22 }}>{t.flag}</span>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                width: 140,
                flexShrink: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>{t.name}</span>
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 999,
                  height: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${t.pct}%`,
                    background: RANK_BAR,
                    borderRadius: 999,
                  }}
                />
              </div>
              <span
                style={{ fontSize: 12, fontWeight: 700, color: C.amber, width: 36, textAlign: "right" }}
              >
                {t.pct}%
              </span>
            </div>
          ))}
        </div>
        {rankSort === "pct" && !showAll && sortedTeams.length > 6 && (
          <button
            onClick={() => setShowAll(true)}
            className="fc-btn"
            style={{
              width: "100%",
              marginTop: 8,
              background: C.surface,
              border: `1px solid ${C.borderHi}`,
              color: C.t2,
              borderRadius: 10,
              padding: "9px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .18s ease",
            }}
          >
            Ver todos os 48 times ↓
          </button>
        )}
        {showAll && rankSort === "pct" && (
          <button
            onClick={() => setShowAll(false)}
            className="fc-btn"
            style={{
              width: "100%",
              marginTop: 8,
              background: C.surface,
              border: `1px solid ${C.borderHi}`,
              color: C.t2,
              borderRadius: 10,
              padding: "9px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .18s ease",
            }}
          >
            Ver menos ↑
          </button>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.t2,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          ✨ Últimas Adicionadas
        </div>
        {recent.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {recent.map((s) => (
              <StickerCard key={s.id} s={s} onClick={(st) => goToAlbum({ search: st.code })} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "24px", color: C.t3, fontSize: 13 }}>
            Nenhuma figurinha ainda
          </div>
        )}
      </div>
    </div>
  );
}
