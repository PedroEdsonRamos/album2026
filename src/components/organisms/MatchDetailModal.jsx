import { useState, useEffect } from "react";
import { formatBrasilia, getMatchStatus, getMatchDate } from "@/services/worldcup";
import { ResumoTab } from "@/components/organisms/matchDetail/ResumoTab";
import { ConfrontoTab } from "@/components/organisms/matchDetail/ConfrontoTab";
import { EstatisticasTab } from "@/components/organisms/matchDetail/EstatisticasTab";
import { EscalacoesTab } from "@/components/organisms/matchDetail/EscalacoesTab";
import { HighlightsTab } from "@/components/organisms/matchDetail/HighlightsTab";
import { InfoTab } from "@/components/organisms/matchDetail/InfoTab";

export function MatchDetailModal({ match, onClose }) {
  const [tab, setTab] = useState("resumo");

  const status = match ? getMatchStatus(match) : null;
  const isScheduled = status?.type === "scheduled";

  // Tabs dinâmicas conforme status do jogo
  const tabs = isScheduled
    ? [
        { id: "confronto", label: "Confronto" },
        { id: "escalacoes", label: "Escalações" },
        { id: "info", label: "Estádio" },
      ]
    : [
        { id: "resumo", label: "Resumo" },
        { id: "estatisticas", label: "Estatísticas" },
        { id: "escalacoes", label: "Escalações" },
        { id: "highlights", label: "Vídeos" },
      ];

  // Tab inicial: a primeira disponível
  const firstTabId = tabs[0].id;
  useEffect(() => {
    setTab(firstTabId);
  }, [match?.id, firstTabId]);

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

        {/* Tabs */}
        <ModalTabs tabs={tabs} value={tab} onChange={setTab} />

        {/* Conteúdo scrollável */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 16px 80px",
          WebkitOverflowScrolling: "touch",
        }}>
          {tab === "resumo" && <ResumoTab match={match} />}
          {tab === "confronto" && <ConfrontoTab match={match} />}
          {tab === "estatisticas" && <EstatisticasTab match={match} />}
          {tab === "escalacoes" && <EscalacoesTab match={match} />}
          {tab === "highlights" && <HighlightsTab match={match} />}
          {tab === "info" && <InfoTab match={match} />}
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
