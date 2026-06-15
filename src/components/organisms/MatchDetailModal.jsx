import { useState, useEffect, useMemo } from "react";
import {
  formatBrasilia, getMatchStatus, getMatchDate,
  getLiveEvents, getMatchStatistics, getLineups, getHighlights,
  getHeadToHead, getLastFiveGames,
} from "@/services/worldcup";
import { ResumoTab } from "@/components/organisms/matchDetail/ResumoTab";
import { ConfrontoTab } from "@/components/organisms/matchDetail/ConfrontoTab";
import { EstatisticasTab } from "@/components/organisms/matchDetail/EstatisticasTab";
import { EscalacoesTab } from "@/components/organisms/matchDetail/EscalacoesTab";
import { HighlightsTab } from "@/components/organisms/matchDetail/HighlightsTab";
import { InfoTab } from "@/components/organisms/matchDetail/InfoTab";
import { LoadingTab, EmptyTab, hasValidStats } from "@/components/organisms/matchDetail/_shared";

export function MatchDetailModal({ match, onClose }) {
  const [tab, setTab] = useState(null);
  const [tabData, setTabData] = useState({
    events: null, stats: null, lineups: null,
    highlights: null, h2h: null, homeForm: null, awayForm: null,
  });
  const [loading, setLoading] = useState(true);

  const status = match ? getMatchStatus(match) : null;
  const isScheduled = status?.type === "scheduled";
  const matchId = match?.id ?? match?.fixture?.id;
  const homeId = match?.homeTeam?.id ?? match?.teams?.home?.id;
  const awayId = match?.awayTeam?.id ?? match?.teams?.away?.id;
  const hasVenue = !!(match?.venue?.name || match?.fixture?.venue?.name);

  // Carrega todos os dados em paralelo (cache compartilhado torna isso barato)
  useEffect(() => {
    if (!matchId) return;
    let mounted = true;
    setLoading(true);
    setTab(null);

    const safe = (p) => p.then((r) => r?.data ?? r ?? []).catch(() => []);

    Promise.all([
      isScheduled ? Promise.resolve([]) : safe(getLiveEvents(matchId)),
      isScheduled ? Promise.resolve([]) : safe(getMatchStatistics(matchId)),
      safe(getLineups(matchId)),
      isScheduled ? Promise.resolve([]) : safe(getHighlights(matchId)),
      isScheduled && homeId && awayId ? safe(getHeadToHead(homeId, awayId)) : Promise.resolve([]),
      isScheduled && homeId ? safe(getLastFiveGames(homeId)) : Promise.resolve([]),
      isScheduled && awayId ? safe(getLastFiveGames(awayId)) : Promise.resolve([]),
    ]).then(([events, stats, lineups, highlights, h2h, homeForm, awayForm]) => {
      if (!mounted) return;
      setTabData({ events, stats, lineups, highlights, h2h, homeForm, awayForm });
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [matchId, isScheduled, homeId, awayId]);

  // Tabs disponíveis = apenas as que têm dado
  const availableTabs = useMemo(() => {
    if (loading) return [];
    const tabs = [];

    if (isScheduled) {
      if (tabData.h2h?.length > 0 || tabData.homeForm?.length > 0 || tabData.awayForm?.length > 0) {
        tabs.push({ id: "confronto", label: "Confronto" });
      }
      if (tabData.lineups?.length > 0) tabs.push({ id: "escalacoes", label: "Escalações" });
    } else {
      if (tabData.events?.length > 0) tabs.push({ id: "resumo", label: "Resumo" });
      if (hasValidStats(tabData.stats)) tabs.push({ id: "estatisticas", label: "Estatísticas" });
      if (tabData.lineups?.length > 0) tabs.push({ id: "escalacoes", label: "Escalações" });
      if (tabData.highlights?.length > 0) tabs.push({ id: "highlights", label: "Vídeos" });
    }

    if (hasVenue) tabs.push({ id: "info", label: "Estádio" });

    return tabs;
  }, [loading, tabData, isScheduled, hasVenue]);

  // Seleciona primeira tab disponível automaticamente
  useEffect(() => {
    if (availableTabs.length > 0 && !tab) {
      setTab(availableTabs[0].id);
    }
  }, [availableTabs, tab]);

  if (!match) return null;

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
        <ModalHeader match={match} status={status} onClose={onClose} />

        {loading ? (
          <LoadingTab message="Carregando detalhes..." />
        ) : availableTabs.length === 0 ? (
          <EmptyTab message="Nenhum detalhe disponível para esta partida ainda." />
        ) : (
          <>
            {/* Tabs */}
            <ModalTabs tabs={availableTabs} value={tab} onChange={setTab} />

            {/* Conteúdo scrollável */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 16px 80px",
              WebkitOverflowScrolling: "touch",
            }}>
              {tab === "resumo" && <ResumoTab events={tabData.events} />}
              {tab === "confronto" && (
                <ConfrontoTab
                  match={match}
                  h2h={tabData.h2h}
                  homeForm={tabData.homeForm}
                  awayForm={tabData.awayForm}
                />
              )}
              {tab === "estatisticas" && <EstatisticasTab stats={tabData.stats} />}
              {tab === "escalacoes" && <EscalacoesTab lineups={tabData.lineups} />}
              {tab === "highlights" && <HighlightsTab highlights={tabData.highlights} />}
              {tab === "info" && <InfoTab match={match} />}
            </div>
          </>
        )}
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
function ModalHeader({ match, status, onClose }) {
  const isLive = status.type === "live";
  const isFinished = status.type === "finished";
  const dateStr = getMatchDate(match);
  const { date, time } = formatBrasilia(dateStr);

  const homeTeam = match.homeTeam ?? match.teams?.home ?? {};
  const awayTeam = match.awayTeam ?? match.teams?.away ?? {};

  const homeScore = match.state?.score?.current?.[0] ?? match.homeScore ?? match.goals?.home;
  const awayScore = match.state?.score?.current?.[1] ?? match.awayScore ?? match.goals?.away;
  const hasScore = homeScore !== undefined && homeScore !== null;

  return (
    <div style={{ padding: "0 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
        }}>
          {date} · {time}
        </span>
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
              {homeScore} <span style={{ color: "rgba(255,255,255,0.3)" }}>–</span> {awayScore}
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
        {team.name ?? "—"}
      </div>
    </div>
  );
}

/* =========== TABS =========== */
function ModalTabs({ tabs, value, onChange }) {
  return (
    <div style={{
      display: "flex",
      overflowX: "auto",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 8px",
      WebkitOverflowScrolling: "touch",
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: "12px 16px",
            background: "transparent",
            border: "none",
            borderBottom: value === t.id ? "2px solid #f59e0b" : "2px solid transparent",
            color: value === t.id ? "#fbbf24" : "rgba(255,255,255,0.5)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >{t.label}</button>
      ))}
    </div>
  );
}
