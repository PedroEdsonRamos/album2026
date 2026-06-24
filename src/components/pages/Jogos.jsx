import { useState, useEffect, useRef, useMemo } from "react";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs.jsx";
import {
  getFixtures, getStandings, formatBrasilia, getMatchStatus,
  todayKeyBrasilia, getMatchDate, extractScore,
  getOpenFootballData, findGoals,
} from "@/services/worldcup";
import { BallIcon } from "@/components/icons/BallIcon.jsx";
import { MatchDetailModal } from "@/components/organisms/MatchDetailModal";
import { getTeamName } from "@/data/teamsTranslation";
import { ChaveamentoView } from "@/components/pages/ChaveamentoView.jsx";

export function Jogos() {
  const [tab, setTab] = useState("cronograma");
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState({ groups: [], thirdPlaceTable: [] });
  const [ofData, setOfData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true); setError(null);
      const [fix, std, of] = await Promise.all([
        getFixtures(),
        getStandings(),
        getOpenFootballData(),
      ]);
      setFixtures(fix);
      setStandings(std);
      setOfData(of);
    } catch {
      setError("Não foi possível carregar os dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", color: "#fff", paddingBottom: 80 }}>
      <SegmentedTabs
        items={[
          { id: "cronograma", label: "Cronograma" },
          { id: "classificacao", label: "Classificação" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {loading && <Loading />}
      {error && <ErrorState msg={error} onRetry={load} />}
      {!loading && !error && tab === "cronograma" && (
        <CronogramaView fixtures={fixtures} onSelectMatch={setSelectedMatch} ofData={ofData} />
      )}
      {!loading && !error && tab === "classificacao" && (
        <ClassificacaoView standings={standings} fixtures={fixtures} onSelectMatch={setSelectedMatch} />
      )}

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}

/* ============== CRONOGRAMA INTELIGENTE ============== */
function CronogramaView({ fixtures, onSelectMatch, ofData }) {
  const todayKey = todayKeyBrasilia();
  const hojeRef = useRef(null);
  const proximaRef = useRef(null);

  const [phaseFilter, setPhaseFilter] = useState("todos");
  const [teamFilter, setTeamFilter] = useState("");

  const [openDays, setOpenDays] = useState({});
  const [openMonths, setOpenMonths] = useState({});
  const toggleDay = (key) => setOpenDays(p => ({ ...p, [key]: !p[key] }));
  const toggleMonth = (key) => setOpenMonths(p => ({ ...p, [key]: !p[key] }));

  // Aplica filtros antes de agrupar por data
  const filtered = useMemo(() => {
    return fixtures.filter(m => {
      const round = String(m.round ?? m.group ?? m.league?.round ?? "").toLowerCase();

      if (phaseFilter !== "todos") {
        if (phaseFilter === "grupos" && !round.includes("group")) return false;
        if (phaseFilter === "r32" && !round.includes("round of 32")) return false;
        if (phaseFilter === "oitavas" && !round.includes("round of 16")) return false;
        if (phaseFilter === "quartas" && !round.includes("quarter")) return false;
        if (phaseFilter === "semi" && !round.includes("semi")) return false;
        if (phaseFilter === "final" && !(round.includes("final") && !round.includes("semi"))) return false;
      }

      if (teamFilter.trim()) {
        const q = teamFilter.toLowerCase();
        const homeT = m.homeTeam ?? m.teams?.home;
        const awayT = m.awayTeam ?? m.teams?.away;
        const home = `${getTeamName(homeT)} ${homeT?.name ?? ""}`.toLowerCase();
        const away = `${getTeamName(awayT)} ${awayT?.name ?? ""}`.toLowerCase();
        if (!home.includes(q) && !away.includes(q)) return false;
      }

      return true;
    });
  }, [fixtures, phaseFilter, teamFilter]);

  const { todayMatches, futureGroups, pastGroups } = useMemo(() => {
    const todayMatches = [];
    const futureMap = {};
    const pastMap = {};

    filtered.forEach(m => {
      const dateStr = getMatchDate(m);
      if (!dateStr) return;
      const { dateKey, date } = formatBrasilia(dateStr);

      if (dateKey === todayKey) {
        todayMatches.push(m);
      } else if (dateKey > todayKey) {
        if (!futureMap[dateKey]) futureMap[dateKey] = { label: date, items: [] };
        futureMap[dateKey].items.push(m);
      } else {
        if (!pastMap[dateKey]) {
          const dObj = new Date(dateKey + "T12:00:00Z");
          const wday = dObj.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" });
          const dayNum = dObj.toLocaleDateString("pt-BR", { day: "numeric", timeZone: "UTC" });
          const monthLong = dObj.toLocaleDateString("pt-BR", { month: "long", timeZone: "UTC" });
          const dayLabel = `${wday.charAt(0).toUpperCase() + wday.slice(1)}, ${dayNum} de ${monthLong}`;
          pastMap[dateKey] = { label: dayLabel, items: [] };
        }
        pastMap[dateKey].items.push(m);
      }
    });

    // Futuros: cronológica crescente
    const futureGroups = Object.entries(futureMap)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([key, v]) => ({ key, ...v }));

    // Passados: reverso (mais recente primeiro)
    const pastGroups = Object.entries(pastMap)
      .sort(([a],[b]) => b.localeCompare(a))
      .map(([key, v]) => ({ key, ...v }));

    const sortByTime = (a, b) => new Date(getMatchDate(a)) - new Date(getMatchDate(b));
    todayMatches.sort(sortByTime);
    futureGroups.forEach(g => g.items.sort(sortByTime));
    pastGroups.forEach(g => g.items.sort(sortByTime));

    return { todayMatches, futureGroups, pastGroups };
  }, [filtered, todayKey]);

  const pastByMonth = useMemo(() => {
    const map = {};
    pastGroups.forEach(g => {
      const monthKey = g.key.slice(0, 7);
      if (!map[monthKey]) {
        const d = new Date(monthKey + "-01T12:00:00Z");
        const monthName = d.toLocaleDateString("pt-BR", { month: "long", timeZone: "UTC" });
        const year = d.getUTCFullYear();
        const label = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}, ${year}`;
        map[monthKey] = { key: monthKey, label, days: [] };
      }
      map[monthKey].days.push(g);
    });
    return Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
  }, [pastGroups]);

  // Scroll para HOJE ou próxima rodada ao abrir
  useEffect(() => {
    const target = hojeRef.current ?? proximaRef.current;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [todayMatches.length, futureGroups.length]);

  return (
    <div style={{ padding: "8px 0 0" }}>
      <FilterBar
        phaseFilter={phaseFilter}
        setPhaseFilter={setPhaseFilter}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
      />

      <div style={{ padding: "0" }}>
      {filtered.length === 0 && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          Nenhum jogo encontrado com esses filtros.
        </div>
      )}
      {/* PASSADOS (colapsável por mês → dia) */}
      {pastGroups.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
            marginBottom: 10,
          }}>
            Jogos anteriores
          </div>

          {pastByMonth.map(month => (
            <div key={month.key} style={{ marginBottom: 8 }}>
              <CollapseHeader
                label={month.label}
                count={month.days.reduce((acc, d) => acc + d.items.length, 0)}
                open={!!openMonths[month.key]}
                onToggle={() => toggleMonth(month.key)}
              />
              {openMonths[month.key] && (
                <div style={{ marginTop: 8, paddingLeft: 4 }}>
                  {month.days.map(day => (
                    <DayCollapse
                      key={day.key}
                      day={day}
                      open={!!openDays[day.key]}
                      onToggle={() => toggleDay(day.key)}
                      onSelectMatch={onSelectMatch}
                      ofData={ofData}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* HOJE (no meio, destacado) */}
      {todayMatches.length > 0 && (
        <div ref={hojeRef} style={{ marginBottom: 28 }}>
          <SectionHeader label="HOJE" highlight />
          {todayMatches.map(m => <MatchCard key={getMatchId(m)} fixture={m} onClick={onSelectMatch} ofData={ofData} />)}
        </div>
      )}

      {/* PRÓXIMOS (embaixo) */}
      {futureGroups.length > 0 && (
        <div>
          {futureGroups.map((group, idx) => (
            <div
              key={group.key}
              ref={idx === 0 && todayMatches.length === 0 ? proximaRef : null}
              style={{ marginBottom: 24 }}
            >
              <SectionHeader
                label={group.label}
                badge={idx === 0 && todayMatches.length === 0 ? "PRÓXIMA RODADA" : null}
              />
              {group.items.map(m => <MatchCard key={getMatchId(m)} fixture={m} onClick={onSelectMatch} ofData={ofData} />)}
            </div>
          ))}
        </div>
      )}

      {todayMatches.length === 0 && futureGroups.length === 0 && pastGroups.length === 0 && (
        <EmptyState
          icon={<BallIcon size={56} color="rgba(255,255,255,0.3)" />}
          message="Nenhum jogo encontrado."
        />
      )}
      </div>
    </div>
  );
}

/* ============== FILTROS ============== */
function FilterBar({ phaseFilter, setPhaseFilter, teamFilter, setTeamFilter }) {
  return (
    <div style={{ padding: "12px 0 0" }}>
      <input
        type="text"
        placeholder="Buscar seleção..."
        value={teamFilter}
        onChange={(e) => setTeamFilter(e.target.value)}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "10px 14px",
          color: "#fff",
          fontSize: 16,
          fontFamily: "inherit",
          outline: "none",
          marginBottom: 10,
          boxSizing: "border-box",
        }}
      />

      <div style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        paddingBottom: 8,
        WebkitOverflowScrolling: "touch",
      }}>
        {[
          { id: "todos", label: "Todos" },
          { id: "grupos", label: "Grupos" },
          { id: "r32", label: "R32" },
          { id: "oitavas", label: "Oitavas" },
          { id: "quartas", label: "Quartas" },
          { id: "semi", label: "Semi" },
          { id: "final", label: "Final" },
        ].map(opt => (
          <FilterChip
            key={opt.id}
            active={phaseFilter === opt.id}
            onClick={() => setPhaseFilter(opt.id)}
          >{opt.label}</FilterChip>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 999,
        border: active
          ? "1px solid rgba(245,158,11,0.5)"
          : "1px solid rgba(255,255,255,0.1)",
        background: active
          ? "rgba(245,158,11,0.12)"
          : "rgba(255,255,255,0.04)",
        color: active ? "#fbbf24" : "rgba(255,255,255,0.55)",
        fontWeight: 700,
        fontSize: 11,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >{children}</button>
  );
}

function getMatchId(m) {
  return m.id ?? m.fixture?.id ?? getMatchDate(m);
}

/* ============== COLLAPSE HELPERS ============== */
function CollapseHeader({ label, count, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "11px 14px",
        color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit",
        textTransform: "capitalize",
      }}
    >
      <span>{label} <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>({count} {count === 1 ? "jogo" : "jogos"})</span></span>
      <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: 15 }}>▾</span>
    </button>
  );
}

function DayCollapse({ day, open, onToggle, onSelectMatch, ofData }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <CollapseHeader
        label={day.label}
        count={day.items.length}
        open={open}
        onToggle={onToggle}
      />
      {open && (
        <div style={{ marginTop: 8 }}>
          {day.items.map(m => (
            <MatchCard key={getMatchId(m)} fixture={m} onClick={onSelectMatch} ofData={ofData} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============== SECTION HEADER ============== */
function SectionHeader({ label, highlight, muted, badge }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
      paddingLeft: 4,
    }}>
      {highlight && (
        <span style={{
          background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
          color: "#0c0c1a",
          padding: "3px 10px",
          borderRadius: 8,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
          boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
        }}>HOJE</span>
      )}
      {!highlight && (
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: muted ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)",
        }}>
          {label}
        </span>
      )}
      {badge && (
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#fbbf24",
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.25)",
          padding: "2px 8px",
          borderRadius: 6,
          letterSpacing: "0.1em",
        }}>{badge}</span>
      )}
    </div>
  );
}

/* ============== MATCH CARD ============== */
function MatchCard({ fixture: m, onClick, ofData }) {
  const dateStr = getMatchDate(m);
  if (!dateStr) return null;

  const { time } = formatBrasilia(dateStr);
  const status = getMatchStatus(m);
  const isLive = status.type === "live";
  const isFinished = status.type === "finished";

  const homeTeam = m.homeTeam ?? m.teams?.home ?? {};
  const awayTeam = m.awayTeam ?? m.teams?.away ?? {};

  const score = extractScore(m);
  const hasScore = score !== null;

  // Busca gols do openfootball
  const goals = hasScore ? findGoals(m, ofData) : null;
  const hasGoals = goals && (goals.home.length > 0 || goals.away.length > 0);

  const homeWon = hasScore && Number(score.home) > Number(score.away);
  const awayWon = hasScore && Number(score.away) > Number(score.home);

  const round = m.round ?? m.group ?? m.league?.round ?? "";
  const roundLabel = formatRound(round);

  return (
    <div
      onClick={() => onClick?.(m)}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
      onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      style={{
        background: isLive
          ? "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.04))"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${isLive ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 14,
        padding: "12px 14px 10px",
        marginBottom: 8,
        boxShadow: isLive ? "0 4px 20px rgba(245,158,11,0.15)" : "none",
        cursor: "pointer",
        transition: "transform 0.15s",
      }}
    >
      {/* TOPO: Status / Horário (centralizado) */}
      <div style={{
        textAlign: "center",
        marginBottom: 10,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: isLive ? "#f59e0b" : "rgba(255,255,255,0.45)",
      }}>
        {isLive ? (
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow: "0 0 6px #f59e0b",
                animation: "pulse 1.5s ease-in-out infinite",
                display: "inline-block",
              }}/>
              {status.label}
            </span>
            {m._cachedAt && (
              <div style={{
                fontSize: 9,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                marginTop: 2,
                letterSpacing: "0.03em",
              }}>
                Atualizado às {formatBrasilia(m._cachedAt).time}
              </div>
            )}
          </div>
        ) : isFinished ? (
          <span style={{ textTransform: "uppercase" }}>Encerrado</span>
        ) : (
          time
        )}
      </div>

      {/* CENTRO: Times (vertical) + Placar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 8,
        alignItems: "center",
      }}>
        <TeamCol team={homeTeam} won={homeWon} />

        <div style={{ minWidth: 72, textAlign: "center", padding: "0 4px" }}>
          {hasScore ? (
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}>
              {score.home}
              <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 600, margin: "0 6px" }}>–</span>
              {score.away}
            </div>
          ) : (
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>×</div>
          )}
        </div>

        <TeamCol team={awayTeam} won={awayWon} />
      </div>

      {/* GOLS */}
      {hasGoals && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 20px 1fr",
          gap: 4,
          marginTop: 8,
          padding: "0 4px",
        }}>
          {/* Gols mandante (alinhados à direita) */}
          <div style={{ textAlign: "right" }}>
            {goals.home.map((g, i) => (
              <GoalLine key={i} goal={g} />
            ))}
          </div>

          {/* Separador central */}
          <div />

          {/* Gols visitante (alinhados à esquerda) */}
          <div style={{ textAlign: "left" }}>
            {goals.away.map((g, i) => (
              <GoalLine key={i} goal={g} />
            ))}
          </div>
        </div>
      )}

      {/* RODAPÉ: Rodada */}
      {roundLabel && (
        <div style={{
          textAlign: "center",
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
        }}>
          {roundLabel}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

function TeamCol({ team, won }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      minWidth: 0,
    }}>
      {team?.logo ? (
        <img
          src={team.logo}
          alt=""
          style={{ width: 36, height: 36, objectFit: "contain" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}/>
      )}
      <span style={{
        fontSize: 12,
        fontWeight: won ? 800 : 600,
        color: won ? "#fff" : "rgba(255,255,255,0.85)",
        textAlign: "center",
        lineHeight: 1.2,
        wordBreak: "break-word",
        overflowWrap: "break-word",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        maxWidth: "100%",
      }}>
        {getTeamName(team)}
      </span>
    </div>
  );
}

function GoalLine({ goal }) {
  return (
    <div style={{
      fontSize: 10,
      color: "rgba(255,255,255,0.6)",
      lineHeight: 1.6,
    }}>
      <span style={{ color: "rgba(255,255,255,0.35)", marginRight: 2 }}>⚽</span>
      {" "}
      <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
        {goal.name}
      </span>
      {" "}
      <span style={{ color: "rgba(255,255,255,0.4)" }}>
        {goal.minute}'{goal.penalty ? " (P)" : ""}
      </span>
    </div>
  );
}

function formatRound(round) {
  return String(round)
    .replace("Group Stage - ", "Rodada ")
    .replace("Round of 32", "R32")
    .replace("Round of 16", "Oitavas")
    .replace("Quarter-finals", "Quartas")
    .replace("Semi-finals", "Semifinal")
    .replace("3rd Place Final", "3º lugar")
    .replace("Final", "Final");
}

/* ============== CLASSIFICAÇÃO ============== */
function ClassificacaoView({ standings, fixtures = [], onSelectMatch }) {
  const [view, setView] = useState("grupos");
  const [groupFilter, setGroupFilter] = useState("todos");

  return (
    <div>
      <div style={{ paddingTop: 16 }}>
        <SegmentedTabs
          items={[
            { id: "grupos", label: "Grupos" },
            { id: "chaveamento", label: "Chaveamento" },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {view === "grupos" && (
        <>
          <div style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            padding: "12px 0 8px",
            WebkitOverflowScrolling: "touch",
          }}>
            <FilterChip
              active={groupFilter === "todos"}
              onClick={() => setGroupFilter("todos")}
            >Todos</FilterChip>
            {["A","B","C","D","E","F","G","H","I","J","K","L"].map(g => (
              <FilterChip
                key={g}
                active={groupFilter === g}
                onClick={() => setGroupFilter(g)}
              >Grupo {g}</FilterChip>
            ))}
          </div>
          <GruposView standings={standings} groupFilter={groupFilter} />
        </>
      )}
      {view === "chaveamento" && (
        <ChaveamentoView standings={standings} fixtures={fixtures} onSelectMatch={onSelectMatch} />
      )}
    </div>
  );
}

/* ============== GRUPOS ============== */
function GruposView({ standings, groupFilter = "todos" }) {
  const groups = standings?.groups ?? [];
  const filtered = groupFilter === "todos"
    ? groups
    : groups.filter(g => g.name === `Group ${groupFilter}`);

  return (
    <div style={{ padding: "16px 0 0" }}>
      {filtered.map((group, idx) => (
        <GroupTable key={idx} group={group} />
      ))}

      <Legend />
    </div>
  );
}

function GroupTable({ group }) {
  const columns = "minmax(0, 1fr) 24px 24px 24px 24px 32px 32px";
  const standings = group.standings ?? [];

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Cabeçalho do grupo */}
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.18em",
        color: "#f59e0b",
        textTransform: "uppercase",
        marginBottom: 10,
        paddingLeft: 4,
      }}>
        {group.name}
      </div>

      {/* Container da tabela com overflow controlado */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        {/* Header da tabela */}
        <div style={{
          display: "grid",
          gridTemplateColumns: columns,
          gap: 6,
          fontSize: 10,
          color: "rgba(255,255,255,0.4)",
          fontWeight: 700,
          padding: "10px 12px 6px",
          letterSpacing: "0.05em",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <span style={{ textAlign: "left" }}>SELEÇÃO</span>
          <span style={{ textAlign: "center" }}>J</span>
          <span style={{ textAlign: "center" }}>V</span>
          <span style={{ textAlign: "center" }}>E</span>
          <span style={{ textAlign: "center" }}>D</span>
          <span style={{ textAlign: "center" }}>SG</span>
          <span style={{ textAlign: "center" }}>P</span>
        </div>

        {/* Linhas */}
        {standings.map((row, tIdx) => {
          const advances = tIdx < 2;
          const t = row.total ?? {};
          const sg = (t.scoredGoals ?? 0) - (t.receivedGoals ?? 0);

          return (
            <div key={row.team?.id ?? tIdx} style={{
              display: "grid",
              gridTemplateColumns: columns,
              gap: 6,
              padding: "10px 12px",
              borderLeft: advances
                ? "2px solid rgba(34,197,94,0.5)"
                : "2px solid transparent",
              borderBottom: tIdx < standings.length - 1
                ? "1px solid rgba(255,255,255,0.03)"
                : "none",
              alignItems: "center",
            }}>
              {/* Coluna do time: posição + logo + nome (com ellipsis) */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: advances ? "#22c55e" : "rgba(255,255,255,0.4)",
                  minWidth: 12,
                  flexShrink: 0,
                }}>{row.position ?? tIdx + 1}</span>

                {row.team?.logo && (
                  <img
                    src={row.team.logo}
                    alt=""
                    style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}

                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  minWidth: 0,
                  flex: 1,
                  lineHeight: 1.2,
                }}>{getTeamName(row.team)}</span>
              </div>

              {/* Estatísticas - tamanho fixo, nunca crescem */}
              <span style={cellStyle}>{t.games ?? 0}</span>
              <span style={cellStyle}>{t.wins ?? 0}</span>
              <span style={cellStyle}>{t.draws ?? 0}</span>
              <span style={cellStyle}>{t.loses ?? 0}</span>
              <span style={{
                ...cellStyle,
                color: sg > 0 ? "#22c55e" : sg < 0 ? "rgba(239,68,68,0.7)" : cellStyle.color,
                fontWeight: 700,
              }}>{sg > 0 ? `+${sg}` : sg}</span>
              <span style={{
                ...cellStyle,
                fontSize: 13,
                fontWeight: 800,
                color: advances ? "#22c55e" : "#fff",
              }}>{row.points ?? 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const cellStyle = {
  textAlign: "center",
  fontSize: 12,
  color: "rgba(255,255,255,0.7)",
};

function Legend() {
  return (
    <div style={{
      display: "flex",
      gap: 12,
      padding: "4px 12px 24px",
      fontSize: 10,
      color: "rgba(255,255,255,0.35)",
      flexWrap: "wrap",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{
          width: 8, height: 8, borderRadius: 2,
          background: "rgba(34,197,94,0.5)",
        }}/>
        Classificados (1º e 2º)
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        J=Jogos · V=Vitórias · E=Empates · D=Derrotas · SG=Saldo · P=Pontos
      </span>
    </div>
  );
}

/* ============== LOADING / ERROR / EMPTY ============== */
function Loading() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      gap: 18,
    }}>
      <div style={{ animation: "spin 2s linear infinite" }}>
        <BallIcon size={56} color="rgba(255,255,255,0.4)" />
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>
        Carregando dados da Copa...
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ msg, onRetry }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 24px",
      gap: 18,
    }}>
      <div style={{
        fontSize: 13,
        color: "rgba(255,255,255,0.55)",
        textAlign: "center",
        lineHeight: 1.6,
        maxWidth: 280,
      }}>{msg}</div>
      <button
        onClick={onRetry}
        style={{
          background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
          color: "#0c0c1a",
          border: "none",
          borderRadius: 12,
          padding: "12px 28px",
          fontSize: 14,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 4px 12px rgba(245,158,11,0.25)",
        }}
      >Tentar novamente</button>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "40vh",
      gap: 14,
      padding: "40px 24px",
    }}>
      {icon}
      <div style={{
        fontSize: 13,
        color: "rgba(255,255,255,0.5)",
        textAlign: "center",
        lineHeight: 1.5,
      }}>{message}</div>
    </div>
  );
}
