import { useState } from "react";
import {
  formatBrasilia, getMatchStatus, getMatchDate,
  getLiveEvents, getMatchStatistics, getLineups, getHighlights,
  getHeadToHead, getLastFiveGames, extractScore,
} from "@/services/worldcup";
import { ResumoTab } from "@/components/organisms/matchDetail/ResumoTab";
import { ConfrontoTab } from "@/components/organisms/matchDetail/ConfrontoTab";
import { EstatisticasTab } from "@/components/organisms/matchDetail/EstatisticasTab";
import { EscalacoesTab } from "@/components/organisms/matchDetail/EscalacoesTab";
import { HighlightsTab } from "@/components/organisms/matchDetail/HighlightsTab";
import { InfoTab } from "@/components/organisms/matchDetail/InfoTab";
import { LoadingTab, EmptyTab, hasValidStats } from "@/components/organisms/matchDetail/_shared";
import { getTeamName } from "@/data/teamsTranslation";

export function MatchDetailModal({ match, onClose }) {
  const [section, setSection] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!match) return null;

  const status = getMatchStatus(match);
  const isScheduled = status.type === "scheduled";
  const matchId = match.id ?? match.fixture?.id;
  const homeId = match.homeTeam?.id ?? match.teams?.home?.id;
  const awayId = match.awayTeam?.id ?? match.teams?.away?.id;

  const options = isScheduled
    ? [
        { id: "confronto", label: "Histórico de confrontos", icon: "⚔️" },
        { id: "escalacoes", label: "Escalações prováveis", icon: "📋" },
        { id: "info", label: "Estádio", icon: "🏟️" },
      ]
    : [
        { id: "resumo", label: "Resumo do jogo", icon: "📊" },
        { id: "estatisticas", label: "Estatísticas", icon: "📈" },
        { id: "escalacoes", label: "Escalações", icon: "📋" },
        { id: "highlights", label: "Melhores momentos", icon: "🎬" },
        { id: "info", label: "Estádio", icon: "🏟️" },
      ];

  async function handleSelectSection(sectionId) {
    setSection(sectionId);
    setLoading(true);
    setSectionData(null);

    const safe = (p) => p.then(r => r?.data ?? r ?? []).catch(() => []);

    try {
      let data;
      switch (sectionId) {
        case "resumo":
          data = await safe(getLiveEvents(matchId));
          break;
        case "estatisticas":
          data = await safe(getMatchStatistics(matchId));
          break;
        case "escalacoes":
          data = await safe(getLineups(matchId));
          break;
        case "highlights":
          data = await safe(getHighlights(matchId));
          break;
        case "confronto":
          if (homeId && awayId) {
            const [h2h, hf, af] = await Promise.all([
              safe(getHeadToHead(homeId, awayId)),
              safe(getLastFiveGames(homeId)),
              safe(getLastFiveGames(awayId)),
            ]);
            data = { h2h, homeForm: hf, awayForm: af };
          } else {
            data = { h2h: [], homeForm: [], awayForm: [] };
          }
          break;
        case "info":
          data = "venue";
          break;
        default:
          data = null;
      }
      setSectionData(data);
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setSection(null);
    setSectionData(null);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          zIndex: 998,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: "92vh",
        background: "#0c0c1a",
        borderRadius: "20px 20px 0 0",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.3s ease",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Handle */}
        <div style={{
          width: 40,
          height: 4,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 999,
          margin: "10px auto",
          flexShrink: 0,
        }}/>

        {/* Cabeçalho fixo */}
        <ModalHeader
          match={match}
          status={status}
          onClose={onClose}
          onBack={section ? handleBack : null}
        />

        {/* Conteúdo: menu OU seção carregada */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 16px 80px",
          WebkitOverflowScrolling: "touch",
        }}>
          {section === null && <OptionsMenu options={options} onSelect={handleSelectSection} />}
          {section && loading && <LoadingTab message="Carregando..." />}
          {section && !loading && sectionData !== null && (
            <SectionContent section={section} data={sectionData} match={match} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}

/* =========== CABEÇALHO =========== */
function ModalHeader({ match, status, onClose, onBack }) {
  const isLive = status.type === "live";
  const isFinished = status.type === "finished";
  const dateStr = getMatchDate(match);
  const { date, time } = formatBrasilia(dateStr);

  const homeTeam = match.homeTeam ?? match.teams?.home ?? {};
  const awayTeam = match.awayTeam ?? match.teams?.away ?? {};

  const score = extractScore(match);
  const hasScore = score !== null;

  return (
    <div style={{ padding: "0 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        {onBack ? (
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: 999,
              padding: "6px 12px 6px 8px",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 16 }}>‹</span>
            <span>Voltar</span>
          </button>
        ) : (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
          }}>
            {date} · {time}
          </span>
        )}
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: 999,
            width: 32,
            height: 32,
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >×</button>
      </div>

      {/* Times + placar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 16,
        alignItems: "center",
      }}>
        <TeamHeader team={homeTeam} />

        <div style={{ textAlign: "center", minWidth: 90 }}>
          {hasScore ? (
            <div style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "0.02em",
            }}>
              {score.home} <span style={{ color: "rgba(255,255,255,0.3)" }}>–</span> {score.away}
            </div>
          ) : (
            <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>×</div>
          )}

          <div style={{ marginTop: 6 }}>
            {isLive && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
                color: "#f59e0b",
                background: "rgba(245,158,11,0.12)",
                padding: "4px 9px",
                borderRadius: 6,
                letterSpacing: "0.05em",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#f59e0b",
                  boxShadow: "0 0 6px #f59e0b",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}/>
                {status.label}
              </span>
            )}
            {isFinished && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
              }}>Encerrado</span>
            )}
          </div>
        </div>

        <TeamHeader team={awayTeam} reverse />
      </div>
    </div>
  );
}

function TeamHeader({ team, reverse }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: reverse ? "row" : "row-reverse",
      alignItems: "center",
      gap: 10,
      justifyContent: "flex-start",
      minWidth: 0,
    }}>
      {team.logo && (
        <img
          src={team.logo}
          alt=""
          style={{ width: 44, height: 44, objectFit: "contain", flexShrink: 0 }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
      <div style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#fff",
        textAlign: reverse ? "left" : "right",
        lineHeight: 1.2,
        minWidth: 0,
      }}>
        {getTeamName(team)}
      </div>
    </div>
  );
}

/* =========== MENU DE OPÇÕES =========== */
function OptionsMenu({ options, onSelect }) {
  return (
    <div>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase",
        marginBottom: 12,
        paddingLeft: 2,
      }}>
        O que deseja ver?
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              textAlign: "left",
            }}
            onTouchStart={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.08)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          >
            <span style={{ fontSize: 18, width: 32, textAlign: "center" }}>{opt.icon}</span>
            <span style={{ flex: 1 }}>{opt.label}</span>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========== DESPACHO DE SEÇÃO =========== */
function SectionContent({ section, data, match }) {
  if (section === "resumo") {
    if (!data?.length) return <EmptyTab message="Sem eventos registrados nesta partida." />;
    return <ResumoTab events={data} />;
  }
  if (section === "estatisticas") {
    if (!hasValidStats(data)) return <EmptyTab message="Estatísticas não disponíveis." />;
    return <EstatisticasTab stats={data} />;
  }
  if (section === "escalacoes") {
    if (!data?.length) return <EmptyTab message="Escalações ainda não disponíveis." />;
    return <EscalacoesTab lineups={data} />;
  }
  if (section === "highlights") {
    if (!data?.length) return <EmptyTab message="Melhores momentos ainda não publicados." />;
    return <HighlightsTab highlights={data} />;
  }
  if (section === "confronto") {
    const hasAny = data.h2h?.length || data.homeForm?.length || data.awayForm?.length;
    if (!hasAny) return <EmptyTab message="Sem dados de confrontos anteriores." />;
    return (
      <ConfrontoTab
        match={match}
        h2h={data.h2h}
        homeForm={data.homeForm}
        awayForm={data.awayForm}
      />
    );
  }
  if (section === "info") {
    return <InfoTab match={match} />;
  }
  return null;
}
