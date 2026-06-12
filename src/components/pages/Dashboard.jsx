import { useState, useMemo } from "react";
import { usePersistedFilter } from "@/hooks/usePersistedFilter.js";
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

export function Dashboard({ stickers, setPage, setTeamFilter, goToAlbum, goToTeams }) {
  const total = TOTAL_OFFICIAL;

  const stats = useMemo(() => {
    const isCollected = (s) => s.status === "Tenho" || s.status === "Repetida";

    // COLETADAS: cada código único com status Tenho ou Repetida conta 1x
    const coletadas = stickers.filter(isCollected).length;

    // REPETIDAS: soma dos excedentes (duplicates) de figurinhas Repetida
    const repetidas = stickers
      .filter((s) => s.status === "Repetida")
      .reduce((acc, s) => acc + (s.duplicates ?? 0), 0);

    // JOGADORES: exclui Foto Equipe, Escudo, FWC e CC
    const jogadoresTotais = stickers.filter((s) =>
      s.position !== "Foto Equipe" &&
      s.position !== "Escudo" &&
      !s.code.startsWith("FWC") &&
      s.code !== "00" &&
      !s.code.startsWith("CC")
    );
    const jogadoresColetados = jogadoresTotais.filter(isCollected).length;

    // SELEÇÕES: apenas foto de equipe (posição #13)
    const selecoesTotais = stickers.filter(s => s.position === "Foto Equipe");
    const selecoesColetadas = selecoesTotais.filter(isCollected).length;

    // ESCUDOS: apenas escudos
    const escudosTotais = stickers.filter(s => s.position === "Escudo");
    const escudosColetadas = escudosTotais.filter(isCollected).length;

    // FWC: prefixo FWC + capa "00"
    const fwcTotais = stickers.filter((s) => s.code.startsWith("FWC") || s.code === "00");
    const fwcColetadas = fwcTotais.filter(isCollected).length;

    // COCA-COLA: prefixo CC
    const ccTotais = stickers.filter((s) => s.code.startsWith("CC"));
    const ccColetadas = ccTotais.filter(isCollected).length;

    return {
      coletadas,
      repetidas,
      jogadoresColetados,
      jogadoresTotais: jogadoresTotais.length,
      selecoesColetadas,
      selecoesTotais: selecoesTotais.length,
      escudosColetadas,
      escudosTotais: escudosTotais.length,
      fwcColetadas,
      fwcTotais: fwcTotais.length,
      ccColetadas,
      ccTotais: ccTotais.length,
    };
  }, [stickers]);

  const {
    coletadas, repetidas,
    jogadoresColetados, jogadoresTotais,
    selecoesColetadas, selecoesTotais,
    escudosColetadas, escudosTotais,
    fwcColetadas, fwcTotais,
    ccColetadas, ccTotais,
  } = stats;
  const owned = coletadas;
  const esCollection = getESCollection(stickers);
  const esLilas = esCollection.filter((e) => (e.collectedTypes["Lilás"] ?? 0) > 0).length;
  const esBronze = esCollection.filter((e) => (e.collectedTypes["Bronze"] ?? 0) > 0).length;
  const esPrata = esCollection.filter((e) => (e.collectedTypes["Prata"] ?? 0) > 0).length;
  const esOuro = esCollection.filter((e) => (e.collectedTypes["Ouro"] ?? 0) > 0).length;
  const pct = Math.round((owned / total) * 100);
  const [hRef, hVis] = useInView();
  const pctA = useCounter(hVis ? pct : 0, 1200);
  const [rankSort, setRankSort] = usePersistedFilter("filter_dashboard_ranksort", "pct");
  const [showAll, setShowAll] = usePersistedFilter("filter_dashboard_showall", false);
  const teamStats = useMemo(() => TEAMS.map((t) => {
    const ts = stickers.filter((s) => s.team === t.id);
    const o = ts.filter((s) => s.status === "Tenho" || s.status === "Repetida").length;
    const legendCount = ts.filter((s) => s.rarity !== "Comum" && (s.status === "Tenho" || s.status === "Repetida")).length;
    return { ...t, total: ts.length, owned: o, pct: Math.round((o / (ts.length || 1)) * 100), legendCount };
  }), [stickers]);
  const sortedTeams = useMemo(() => [...teamStats].sort((a, b) => {
    if (rankSort === "pct")  return b.pct - a.pct;
    if (rankSort === "name") return a.name.localeCompare(b.name, "pt-BR");
    return 0;
  }), [teamStats, rankSort]);
  const visibleTeams = useMemo(
    () => rankSort !== "pct" || showAll ? sortedTeams : sortedTeams.slice(0, 6),
    [sortedTeams, rankSort, showAll]
  );
  const recent = useMemo(() => [...stickers]
    .filter((s) => s.status === "Tenho" || s.status === "Repetida")
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 6), [stickers]);

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
        {/* Linha 1: Coletadas / Repetidas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard
            label="Coletadas"
            value={owned}
            sub={`${pct}% do álbum`}
            icon="check"
            color="#22c55e"
            showLine={true}
            onClick={() => goToAlbum({ status: "Tenho" })}
          />
          <StatCard
            label="Repetidas"
            value={repetidas}
            sub="para troca"
            icon="swap"
            color="#f59e0b"
            showLine={true}
            onClick={() => setPage("trocas")}
          />
        </div>
        {/* Linha 2: Jogadores / Seleções */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <StatCard label="Jogadores" value={`${jogadoresColetados} / ${jogadoresTotais}`}
            sub="jogadores de campo"
            icon={null} color="#1fc8d1" noGlow showLine={true}
            onClick={() => goToTeams()} />
          <StatCard label="Seleções" value={`${selecoesColetadas} / ${selecoesTotais}`}
            sub="fotos de equipe"
            icon={null} color="#e2e8f0" noGlow showLine={true}
            onClick={() => goToAlbum({ position: "Foto Equipe" })} />
        </div>
        {/* Linha 3: Escudos / FWC */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <StatCard label="Escudos" value={`${escudosColetadas} / ${escudosTotais}`}
            sub="brasões das seleções"
            icon={null} color="#94a3b8" noGlow showLine={true}
            onClick={() => goToAlbum({ position: "Escudo" })} />
          <StatCard label="FWC" value={`${fwcColetadas} / ${fwcTotais}`}
            sub="especiais FIFA"
            icon={null} color="#94a3b8" noGlow showLine={true}
            onClick={() => goToTeams("Extras", "FWC")} />
        </div>
        {/* Linha 4: Coca-Cola / Extra Stickers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <StatCard label="Coca-Cola" value={`${ccColetadas} / ${ccTotais}`}
            sub="edição especial coca-cola"
            icon={null} color="#f40009" noGlow showLine={true}
            onClick={() => goToTeams("Extras", "CC")} />
          <div
            onClick={() => goToTeams("Extras", "ES")}
            style={{
              background: C.surface,
              border: "1px solid rgba(168,85,247,0.28)",
              borderRadius: 14,
              padding: "12px 14px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(168,85,247,0.13)",
            }}
          >
            <div style={{
              position: "absolute", top: -1, right: -1,
              width: 56, height: 56,
              background: "radial-gradient(circle at top right, rgba(168,85,247,0.50) 0%, rgba(168,85,247,0.18) 50%, transparent 72%)",
              borderRadius: "0 14px 0 0",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", top: 0, left: 14, right: 14, height: 1.5,
              background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.75) 28%, rgba(168,85,247,0.75) 72%, transparent 100%)",
              borderRadius: 999, pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ fontSize: 11, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Extra Stickers
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{esLilas + esBronze + esPrata + esOuro}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>/ 80</span>
              </div>
              <div style={{ fontSize: 10, color: "#a855f7", marginTop: 4 }}>
                para colecionar ou colar
              </div>
            </div>
          </div>
        </div>
        {/* Mini-cards ES: Lilás / Bronze / Prata / Ouro */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
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
                <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: fin.color }}>{count}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: fin.dimColor }}>/20</span>
                </div>
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
