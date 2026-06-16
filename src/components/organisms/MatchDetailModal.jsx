import { useState, useEffect } from "react";
import {
  formatBrasilia, getMatchStatus, getMatchDate,
  getMatchStatistics, getLineups,
  normalizeStatistics, hasValidStatistics, normalizeLineups,
} from "@/services/worldcup";
import { getTeamName } from "@/data/teamsTranslation";
import { getDisplayStats } from "@/data/statsTranslation";

export function MatchDetailModal({ match, onClose }) {
  const [section, setSection] = useState(null);
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
    setSection(null);

    const safe = (p) => p.then(r => r).catch(() => null);

    async function check() {
      const opts = [];
      const loaded = {};

      // Jogo futuro: API não entrega stats/lineups úteis → só estádio
      if (isScheduled) {
        if (hasVenue) opts.push({ id: "info", label: "Estádio", icon: "🏟️" });
        if (mounted) { setAvailable(opts); setData(loaded); setChecking(false); }
        return;
      }

      // Jogo ao vivo/encerrado: estatísticas + escalações
      const [statsRaw, lineupsRaw] = await Promise.all([
        safe(getMatchStatistics(matchId)),
        safe(getLineups(matchId)),
      ]);

      if (hasValidStatistics(statsRaw)) {
        loaded.stats = statsRaw;
        opts.push({ id: "estatisticas", label: "Estatísticas", icon: "📈" });
      }

      const lineups = normalizeLineups(lineupsRaw);
      if (lineups) {
        loaded.lineups = lineups;
        opts.push({ id: "escalacoes", label: "Escalações", icon: "📋" });
      }

      if (hasVenue) {
        opts.push({ id: "info", label: "Estádio", icon: "🏟️" });
      }

      if (mounted) {
        setAvailable(opts);
        setData(loaded);
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
        maxHeight: "92vh", background: "#0c0c1a",
        borderRadius: "20px 20px 0 0", zIndex: 999,
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s ease",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        <div style={{
          width: 40, height: 4, background: "rgba(255,255,255,0.2)",
          borderRadius: 999, margin: "10px auto", flexShrink: 0,
        }}/>

        <ModalHeader
          match={match}
          status={status}
          onClose={onClose}
          onBack={section ? () => setSection(null) : null}
        />

        <div style={{
          flex: 1, overflowY: "auto", padding: "16px 16px 90px",
          WebkitOverflowScrolling: "touch",
        }}>
          {checking && <LoadingSection message="Carregando..." />}

          {!checking && section === null && (
            available && available.length > 0
              ? <OptionsMenu options={available} onSelect={(o) => setSection(o.id)} />
              : <EmptySection message="Sem informações disponíveis para esta partida." />
          )}

          {section === "estatisticas" && <EstatisticasSection raw={data.stats} />}
          {section === "escalacoes" && <EscalacoesSection lineups={data.lineups} match={match} />}
          {section === "info" && <InfoSection venue={venue} match={match} />}
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

function ModalHeader({ match, status, onClose, onBack }) {
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
        {onBack ? (
          <button type="button" onClick={onBack} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 999,
            padding: "6px 12px 6px 8px", color: "#fff", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 16 }}>‹</span> Voltar
          </button>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
            {date} · {time}
          </span>
        )}
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16, padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {teams[0].team.logo && <img src={teams[0].team.logo} style={{ width: 20, height: 20 }} alt=""/>}
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{getTeamName(teams[0].team)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{getTeamName(teams[1].team)}</span>
          {teams[1].team.logo && <img src={teams[1].team.logo} style={{ width: 20, height: 20 }} alt=""/>}
        </div>
      </div>
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

function InfoSection({ venue, match }) {
  const country = match.country ?? null;
  return (
    <div>
      <SectionLabel>Local da partida</SectionLabel>
      <InfoRow label="Estádio" value={venue?.name ?? "—"} />
      {venue?.city && <InfoRow label="Cidade" value={venue.city} />}
      {country?.name && <InfoRow label="País" value={country.name} />}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between",
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function OptionsMenu({ options, onSelect }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
        color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 12, paddingLeft: 2 }}>
        O que deseja ver?
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(opt => (
          <button key={opt.id} type="button" onClick={() => onSelect(opt)} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
          }}>
            <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{opt.icon}</span>
            <span style={{ flex: 1 }}>{opt.label}</span>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>›</span>
          </button>
        ))}
      </div>
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
