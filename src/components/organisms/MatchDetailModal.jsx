import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  formatBrasilia, getMatchStatus, getMatchDate,
  getMatchStatistics, getLineups,
  normalizeStatistics, hasValidStatistics, normalizeLineups,
} from "@/services/worldcup";
import { getTeamName } from "@/data/teamsTranslation";
import { getDisplayStats } from "@/data/statsTranslation";

export function MatchDetailModal({ match, onClose }) {
  const [tab, setTab] = useState(null);
  const [available, setAvailable] = useState([]);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState({});

  const status = getMatchStatus(match);
  const isScheduled = status.type === "scheduled";
  const matchId = match?.id ?? match?.fixture?.id;
  const venue = match?.venue ?? match?.fixture?.venue ?? null;

  useEffect(() => {
    if (!matchId) return;
    let mounted = true;
    setChecking(true);
    setTab(null);

    const safe = (p) => p.then(r => r).catch(() => null);

    async function check() {
      const tabs = [];
      const loaded = {};

      if (isScheduled) {
        tabs.push({ id: "info", label: "Informações" });
        if (mounted) { setAvailable(tabs); setData(loaded); setTab("info"); setChecking(false); }
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
  }, [matchId, isScheduled]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  if (!match) return null;

  return createPortal(
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        zIndex: 99998, animation: "fadeIn 0.2s ease",
      }}/>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        maxWidth: 480, margin: "0 auto",
        height: "86vh",
        background: "#0c0c1a",
        borderRadius: "20px 20px 0 0", zIndex: 99999,
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s ease",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          width: 40, height: 4, background: "rgba(255,255,255,0.2)",
          borderRadius: 999, margin: "10px auto", flexShrink: 0,
        }}/>

        <div style={{ flexShrink: 0 }}>
          <ModalHeader match={match} status={status} onClose={onClose} />
        </div>

        {!checking && available.length > 0 && (
          <div style={{ flexShrink: 0 }}>
            <TabNav tabs={available} value={tab} onChange={setTab} />
          </div>
        )}

        <div style={{
          flex: 1, overflowY: "auto",
          padding: "16px 16px max(40px, env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch",
        }}>
          {checking && <LoadingSection />}
          {!checking && tab === "estatisticas" && <EstatisticasSection raw={data.stats} />}
          {!checking && tab === "escalacoes" && <EscalacoesSection lineups={data.lineups} match={match} />}
          {!checking && tab === "info" && <InfoSection venue={venue} match={match} isScheduled={isScheduled} />}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.15); } }
        @keyframes spinM { to { transform: rotate(360deg); } }
      `}</style>
    </>,
    document.body
  );
}

/* ===== CABEÇALHO (única exibição de times + placar) ===== */
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
          {date} · {time}
        </span>
        <button type="button" onClick={onClose} style={{
          background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 999,
          width: 30, height: 30, color: "#fff", fontSize: 18, cursor: "pointer",
        }}>×</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {homeTeam.logo && <img src={homeTeam.logo} style={{ width: 46, height: 46, objectFit: "contain" }} alt=""/>}
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
            {getTeamName(homeTeam)}
          </span>
        </div>

        <div style={{ textAlign: "center", minWidth: 78 }}>
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
                padding: "3px 9px", borderRadius: 6 }}>
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
          {awayTeam.logo && <img src={awayTeam.logo} style={{ width: 46, height: 46, objectFit: "contain" }} alt=""/>}
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
            {getTeamName(awayTeam)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ===== ABAS DESLIZÁVEIS ===== */
function TabNav({ tabs, value, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto",
      padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      WebkitOverflowScrolling: "touch",
    }}>
      {tabs.map(t => (
        <button key={t.id} type="button" onClick={() => onChange(t.id)} style={{
          padding: "8px 16px", borderRadius: 999,
          border: value === t.id ? "1px solid rgba(245,158,11,0.5)" : "1px solid rgba(255,255,255,0.1)",
          background: value === t.id ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)",
          color: value === t.id ? "#fbbf24" : "rgba(255,255,255,0.55)",
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

/* ===== ESTATÍSTICAS (sem duplicar times) ===== */
function EstatisticasSection({ raw }) {
  const teams = normalizeStatistics(raw);
  if (teams.length < 2) return <EmptySection message="Estatísticas não disponíveis." />;

  const homeStats = teams[0].statistics ?? [];
  const awayStats = teams[1].statistics ?? [];
  const displayStats = getDisplayStats(homeStats, awayStats);
  if (!displayStats.length) return <EmptySection message="Estatísticas não disponíveis." />;

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
  const h = Number(stat.home) || 0;
  const a = Number(stat.away) || 0;
  const total = h + a;
  const homePct = total > 0 ? (h / total) * 100 : 50;

  return (
    <div style={{ padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12,
        alignItems: "center", marginBottom: 7 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", minWidth: 44 }}>{format(stat.home)}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{stat.label}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", minWidth: 44, textAlign: "right" }}>{format(stat.away)}</span>
      </div>
      <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
        <div style={{ width: `${homePct}%`, background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }}/>
        <div style={{ width: `${100 - homePct}%`, background: "rgba(255,255,255,0.15)" }}/>
      </div>
    </div>
  );
}

/* ===== ESCALAÇÕES (layout novo) ===== */
function EscalacoesSection({ lineups, match }) {
  if (!lineups) return <EmptySection message="Escalações não disponíveis." />;
  const homeTeam = match.homeTeam ?? match.teams?.home ?? {};
  const awayTeam = match.awayTeam ?? match.teams?.away ?? {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {lineups.home && <TeamLineup data={lineups.home} team={homeTeam} />}
      {lineups.away && <TeamLineup data={lineups.away} team={awayTeam} />}
    </div>
  );
}

function TeamLineup({ data, team }) {
  const posColor = {
    "Goalkeeper": "#fbbf24", "Defender": "#38bdf8",
    "Midfielder": "#22c55e", "Forward": "#f87171",
  };
  const posLabel = {
    "Goalkeeper": "GOL", "Defender": "DEF", "Midfielder": "MEI", "Forward": "ATA",
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        {(data.logo ?? team.logo) && (
          <img src={data.logo ?? team.logo} style={{ width: 26, height: 26, objectFit: "contain" }} alt=""/>
        )}
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", flex: 1 }}>
          {getTeamName(team)}
        </span>
        {data.formation && (
          <span style={{ fontSize: 12, fontWeight: 800, color: "#0c0c1a",
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)", padding: "4px 10px", borderRadius: 8 }}>
            {data.formation}
          </span>
        )}
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
        color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
        Titulares
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 16 }}>
        {data.starters.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
            <span style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              background: "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#fff",
            }}>{p.number ?? "—"}</span>
            <span style={{ flex: 1, fontSize: 13, color: "#fff", fontWeight: 600 }}>{p.name}</span>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.05em",
              color: posColor[p.position] ?? "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.04)", padding: "3px 7px", borderRadius: 5,
            }}>{posLabel[p.position] ?? ""}</span>
          </div>
        ))}
      </div>

      {data.substitutes.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
            Reservas
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.substitutes.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.03)", borderRadius: 8,
                padding: "5px 10px",
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>{p.number ?? "—"}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ===== INFORMAÇÕES ===== */
function InfoSection({ venue, match, isScheduled }) {
  const country = match.country ?? null;
  const dateStr = getMatchDate(match);
  const { date, time } = formatBrasilia(dateStr);

  return (
    <div>
      {isScheduled && (
        <div style={{
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "center",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>
            Aguardando o início do jogo
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            Estatísticas e escalações ficam disponíveis quando a partida começar.
          </div>
        </div>
      )}

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
        color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
        Detalhes da partida
      </div>
      <InfoRow label="Data" value={date} />
      <InfoRow label="Horário" value={`${time} (Brasília)`} />
      {venue?.name && <InfoRow label="Estádio" value={venue.name} />}
      {venue?.city && <InfoRow label="Cidade" value={venue.city} />}
      {country?.name && country.name !== "World" && <InfoRow label="País" value={country.name} />}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between",
      padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#fff", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

/* ===== HELPERS ===== */
function LoadingSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", gap: 14 }}>
      <div style={{ width: 24, height: 24, border: "3px solid rgba(245,158,11,0.2)",
        borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spinM 0.8s linear infinite" }}/>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Carregando...</div>
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
