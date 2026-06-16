import { useState, useEffect } from "react";
import {
  formatBrasilia, getMatchStatus, getMatchDate,
  getMatchStatistics, getLineups,
  normalizeStatistics, hasValidStatistics, normalizeLineups,
} from "@/services/worldcup";
import { getTeamName } from "@/data/teamsTranslation";
import { getDisplayStats } from "@/data/statsTranslation";

export function MatchDetailModal({ match, onClose }) {
  const [tab, setTab] = useState(null);
  const [available, setAvailable] = useState(null);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState({});

  const status = match ? getMatchStatus(match) : null;
  const isScheduled = status?.type === "scheduled";
  const matchId = match?.id ?? match?.fixture?.id;
  const venue = match?.venue ?? match?.fixture?.venue ?? null;
  const hasVenue = !!(venue?.name);

  useEffect(() => {
    if (!matchId) return;
    let mounted = true;
    setChecking(true);

    const safe = (p) => p.then(r => r).catch(() => null);

    async function check() {
      const tabs = [];
      const loaded = {};

      if (isScheduled) {
        // Jogo futuro: API não entrega stats/lineups → só "Informações"
        tabs.push({ id: "info", label: "Informações" });
        if (mounted) {
          setAvailable(tabs);
          setData(loaded);
          setTab("info");
          setChecking(false);
        }
        return;
      }

      const [statsRaw, lineupsRaw] = await Promise.all([
        safe(getMatchStatistics(matchId)),
        safe(getLineups(matchId)),
      ]);

      if (hasValidStatistics(statsRaw)) {
        loaded.stats = statsRaw;
        tabs.push({ id: "estatisticas", label: "Estatísticas" });
      }

      const lineups = normalizeLineups(lineupsRaw);
      if (lineups) {
        loaded.lineups = lineups;
        tabs.push({ id: "escalacoes", label: "Escalações" });
      }

      tabs.push({ id: "info", label: "Informações" });

      if (mounted) {
        setAvailable(tabs);
        setData(loaded);
        setTab(tabs[0].id);
        setChecking(false);
      }
    }

    check();
    return () => { mounted = false; };
  }, [matchId, isScheduled, hasVenue]);

  if (!match) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        zIndex: 998, animation: "fadeIn 0.2s ease",
      }}/>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: "88vh",                       // ← altura fixa (resolve scroll do voltar)
        maxHeight: "88vh",
        background: "#0c0c1a",
        borderRadius: "20px 20px 0 0", zIndex: 999,
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s ease",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Handle */}
        <div style={{
          width: 40, height: 4, background: "rgba(255,255,255,0.2)",
          borderRadius: 999, margin: "10px auto", flexShrink: 0,
        }}/>

        {/* Cabeçalho fixo (NÃO scrolla) */}
        <div style={{ flexShrink: 0 }}>
          <ModalHeader match={match} status={status} onClose={onClose} />
        </div>

        {/* Abas deslizáveis (fixas, NÃO scrollam verticalmente) */}
        {!checking && available && available.length > 0 && (
          <div style={{ flexShrink: 0 }}>
            <TabNav tabs={available} value={tab} onChange={setTab} />
          </div>
        )}

        {/* Conteúdo scrollável */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "16px 16px 40px",
          WebkitOverflowScrolling: "touch",
        }}>
          {checking && <LoadingSection />}
          {!checking && tab === "estatisticas" && <EstatisticasSection raw={data.stats} />}
          {!checking && tab === "escalacoes" && <EscalacoesSection lineups={data.lineups} match={match} />}
          {!checking && tab === "info" && <InfoSection venue={venue} match={match} status={status} isScheduled={isScheduled} />}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.15); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

function TabNav({ tabs, value, onChange }) {
  return (
    <div style={{
      display: "flex",
      gap: 8,
      overflowX: "auto",
      padding: "12px 16px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: value === t.id
              ? "1px solid rgba(245,158,11,0.5)"
              : "1px solid rgba(255,255,255,0.1)",
            background: value === t.id
              ? "rgba(245,158,11,0.12)"
              : "rgba(255,255,255,0.04)",
            color: value === t.id ? "#fbbf24" : "rgba(255,255,255,0.55)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >{t.label}</button>
      ))}
    </div>
  );
}

function ModalHeader({ match, status, onClose }) {
  const dateStr = getMatchDate(match);
  const { date, time } = formatBrasilia(dateStr);
  const homeTeam = match.homeTeam ?? match.teams?.home ?? {};
  const awayTeam = match.awayTeam ?? match.teams?.away ?? {};

  const score = match?.state?.score?.current;
  let homeScore, awayScore, hasScore = false;
  if (typeof score === "string" && score.includes("-")) {
    const parts = score.split("-").map(s => s.trim());
    homeScore = parts[0]; awayScore = parts[1]; hasScore = true;
  }

  const isLive = status.type === "live";
  const isFinished = status.type === "finished";

  return (
    <div style={{ padding: "0 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
          {date} · {time}
        </span>
        <button type="button" onClick={onClose} style={{
          background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 999,
          width: 32, height: 32, color: "#fff", fontSize: 18, cursor: "pointer",
        }}>×</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {homeTeam.logo && <img src={homeTeam.logo} style={{ width: 48, height: 48, objectFit: "contain" }} alt=""/>}
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "center" }}>
            {getTeamName(homeTeam)}
          </span>
        </div>

        <div style={{ textAlign: "center", minWidth: 80 }}>
          {hasScore ? (
            <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {homeScore} <span style={{ color: "rgba(255,255,255,0.3)" }}>–</span> {awayScore}
            </div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{time}</div>
          )}
          <div style={{ marginTop: 8 }}>
            {isLive && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11,
                fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.12)",
                padding: "4px 10px", borderRadius: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b",
                  boxShadow: "0 0 6px #f59e0b", animation: "pulse 1.5s ease-in-out infinite" }}/>
                {status.label}
              </span>
            )}
            {isFinished && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Encerrado</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {awayTeam.logo && <img src={awayTeam.logo} style={{ width: 48, height: 48, objectFit: "contain" }} alt=""/>}
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "center" }}>
            {getTeamName(awayTeam)}
          </span>
        </div>
      </div>
    </div>
  );
}

function EstatisticasSection({ raw }) {
  const teams = normalizeStatistics(raw);
  if (teams.length < 2) return <EmptySection message="Estatísticas não disponíveis." />;

  const homeStats = teams[0].statistics ?? [];
  const awayStats = teams[1].statistics ?? [];
  const displayStats = getDisplayStats(homeStats, awayStats);
  if (!displayStats.length) return <EmptySection message="Estatísticas não disponíveis." />;

  // SEM cabeçalho de times aqui — o ModalHeader já mostra.
  return (
    <div>
      {displayStats.map((stat, idx) => <StatRow key={idx} stat={stat} />)}
    </div>
  );
}

function StatRow({ stat }) {
  const format = (v) => {
    if (stat.type === "percent") return `${Math.round(v * 100)}%`;
    if (stat.type === "decimal") return Number(v).toFixed(2);
    return Math.round(v);
  };
  const homeVal = Number(stat.home) || 0;
  const awayVal = Number(stat.away) || 0;
  const total = homeVal + awayVal;
  const homePct = total > 0 ? (homeVal / total) * 100 : 50;

  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12,
        alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", minWidth: 44 }}>{format(stat.home)}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{stat.label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", minWidth: 44, textAlign: "right" }}>{format(stat.away)}</span>
      </div>
      <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
        <div style={{ width: `${homePct}%`, background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }}/>
        <div style={{ width: `${100 - homePct}%`, background: "rgba(255,255,255,0.15)" }}/>
      </div>
    </div>
  );
}

function EscalacoesSection({ lineups, match }) {
  if (!lineups) return <EmptySection message="Escalações não disponíveis." />;

  const homeTeam = match.homeTeam ?? match.teams?.home ?? {};
  const awayTeam = match.awayTeam ?? match.teams?.away ?? {};

  return (
    <div>
      {lineups.home && <TeamLineup data={lineups.home} team={homeTeam} />}
      {lineups.away && <TeamLineup data={lineups.away} team={awayTeam} />}
    </div>
  );
}

function TeamLineup({ data, team }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        {(data.logo ?? team.logo) && (
          <img src={data.logo ?? team.logo} style={{ width: 22, height: 22 }} alt=""/>
        )}
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", flex: 1 }}>
          {getTeamName(team)}
        </span>
        {data.formation && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24",
            background: "rgba(245,158,11,0.1)", padding: "3px 8px", borderRadius: 6 }}>
            {data.formation}
          </span>
        )}
      </div>

      <SectionLabel>Titulares</SectionLabel>
      {data.starters.map((p, i) => <PlayerRow key={i} player={p} />)}

      {data.substitutes.length > 0 && (
        <>
          <SectionLabel style={{ marginTop: 14 }}>Reservas</SectionLabel>
          {data.substitutes.map((p, i) => <PlayerRow key={i} player={p} muted />)}
        </>
      )}
    </div>
  );
}

function PlayerRow({ player, muted }) {
  const posMap = {
    "Goalkeeper": "GOL", "Defender": "DEF", "Midfielder": "MEI", "Forward": "ATA",
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 38px", gap: 10,
      padding: "8px 4px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
      <span style={{ fontSize: 12, fontWeight: 700,
        color: muted ? "rgba(255,255,255,0.3)" : "#f59e0b", textAlign: "center" }}>
        {player.number ?? "—"}
      </span>
      <span style={{ fontSize: 13, color: muted ? "rgba(255,255,255,0.5)" : "#fff", fontWeight: 600 }}>
        {player.name ?? "—"}
      </span>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "right", fontWeight: 600 }}>
        {posMap[player.position] ?? ""}
      </span>
    </div>
  );
}

function InfoSection({ venue, match, status, isScheduled }) {
  const dateStr = getMatchDate(match);
  const { date, time } = formatBrasilia(dateStr);

  return (
    <div>
      {isScheduled && (
        <div style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 20,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>
            Aguardando o início do jogo
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            Estatísticas e escalações estarão disponíveis quando a partida começar.
          </div>
        </div>
      )}

      <SectionLabel>Detalhes da partida</SectionLabel>
      <InfoRow label="Data" value={date} />
      <InfoRow label="Horário" value={`${time} (Brasília)`} />
      {venue?.name && <InfoRow label="Estádio" value={venue.name} />}
      {venue?.city && <InfoRow label="Cidade" value={venue.city} />}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between",
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#fff", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function LoadingSection({ message = "Carregando..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", gap: 14 }}>
      <div style={{ width: 24, height: 24, border: "3px solid rgba(245,158,11,0.2)",
        borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{message}</div>
    </div>
  );
}

function EmptySection({ message }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
      {message}
    </div>
  );
}

function SectionLabel({ children, style }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
      color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
      marginBottom: 8, paddingLeft: 2, ...style }}>
      {children}
    </div>
  );
}
