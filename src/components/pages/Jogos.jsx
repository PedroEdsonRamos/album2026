import { useState, useEffect, useRef, useMemo } from "react";
import {
  getFixtures, getStandings, formatBrasilia, getMatchStatus,
  todayKeyBrasilia, getMatchDate, extractScore,
} from "@/services/worldcup";
import { BallIcon } from "@/components/icons/BallIcon.jsx";
import { MatchDetailModal } from "@/components/organisms/MatchDetailModal";
import { getTeamName, TEAM_NAMES_PT } from "@/data/teamsTranslation";

/**
 * Round of 32 oficial da Copa 2026 — 16 jogos (jogos 73 a 88).
 *
 * Slots:
 *  - "1A".."1L" = campeão do grupo A..L
 *  - "2A".."2L" = vice do grupo A..L
 *  - "3-XXXXX"  = melhor 3º colocado dentre os grupos listados (5 grupos elegíveis)
 *
 * Fonte: regulamento oficial FIFA / chaveamento da Copa 2026.
 */
const BRACKET_R32 = [
  { jogo: 73, home: "2A", away: "2B" },
  { jogo: 74, home: "1E", away: "3-ABCDF" },
  { jogo: 75, home: "1F", away: "2C" },
  { jogo: 76, home: "1C", away: "2F" },
  { jogo: 77, home: "1I", away: "3-CDFGH" },
  { jogo: 78, home: "2E", away: "2I" },
  { jogo: 79, home: "1A", away: "3-CEFHI" },
  { jogo: 80, home: "1L", away: "3-EHIJK" },
  { jogo: 81, home: "1D", away: "3-BEFIJ" },
  { jogo: 82, home: "1G", away: "3-AEHIJ" },
  { jogo: 83, home: "2K", away: "2L" },
  { jogo: 84, home: "1H", away: "2J" },
  { jogo: 85, home: "1B", away: "3-EFGIJ" },
  { jogo: 86, home: "1J", away: "2H" },
  { jogo: 87, home: "1K", away: "3-DEIJL" },
  { jogo: 88, home: "2D", away: "2G" },
];

export function Jogos() {
  const [tab, setTab] = useState("cronograma");
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState({ groups: [], thirdPlaceTable: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true); setError(null);
      const [fix, std] = await Promise.all([getFixtures(), getStandings()]);
      setFixtures(fix);
      setStandings(std);
    } catch {
      setError("Não foi possível carregar os dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", color: "#fff", paddingBottom: 80 }}>
      <SegmentedControl tab={tab} onChange={setTab} />
      {loading && <Loading />}
      {error && <ErrorState msg={error} onRetry={load} />}
      {!loading && !error && tab === "cronograma" && (
        <CronogramaView fixtures={fixtures} onSelectMatch={setSelectedMatch} />
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

/* ============== SEGMENTED CONTROL ============== */
function SegmentedControl({ tab, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: 0, padding: 0 }}>
      {[
        { id: "cronograma", label: "Cronograma" },
        { id: "classificacao", label: "Classificação" },
      ].map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 10,
            border: tab === o.id
              ? "1px solid rgba(245,158,11,0.5)"
              : "1px solid rgba(255,255,255,0.1)",
            background: tab === o.id
              ? "rgba(245,158,11,0.12)"
              : "rgba(255,255,255,0.04)",
            color: tab === o.id ? "#fbbf24" : "rgba(255,255,255,0.55)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

/* ============== CRONOGRAMA INTELIGENTE ============== */
function CronogramaView({ fixtures, onSelectMatch }) {
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
        if (!pastMap[dateKey]) pastMap[dateKey] = { label: date, items: [] };
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
        const d = new Date(g.key + "T12:00:00");
        const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
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

      <div style={{ padding: "12px 0 0" }}>
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
          {todayMatches.map(m => <MatchCard key={getMatchId(m)} fixture={m} onClick={onSelectMatch} />)}
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
              {group.items.map(m => <MatchCard key={getMatchId(m)} fixture={m} onClick={onSelectMatch} />)}
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
      <span>{label} <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>({count})</span></span>
      <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: 15 }}>▾</span>
    </button>
  );
}

function DayCollapse({ day, open, onToggle, onSelectMatch }) {
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
            <MatchCard key={getMatchId(m)} fixture={m} onClick={onSelectMatch} />
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
function MatchCard({ fixture: m, onClick }) {
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
      <div style={{ display: "flex", gap: 8, padding: "16px 0 0", flexWrap: "wrap" }}>
        {[
          { id: "grupos", label: "Grupos" },
          { id: "chaveamento", label: "Chaveamento" },
        ].map(o => (
          <button
            key={o.id}
            onClick={() => setView(o.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              border: view === o.id
                ? "1px solid rgba(245,158,11,0.5)"
                : "1px solid rgba(255,255,255,0.1)",
              background: view === o.id
                ? "rgba(245,158,11,0.12)"
                : "rgba(255,255,255,0.04)",
              color: view === o.id ? "#fbbf24" : "rgba(255,255,255,0.55)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >{o.label}</button>
        ))}
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

/* ============== CHAVEAMENTO ============== */
/**
 * Identifica os 8 melhores 3os colocados, ranqueando por:
 * 1) pontos, 2) saldo de gols, 3) gols marcados.
 * Só retorna lista se TODOS os 12 grupos terminaram (cada time com 3 jogos).
 */
function getBestThirdPlaced(groups) {
  const allFinished = groups.length >= 12 && groups.every(g =>
    (g.standings?.length ?? 0) > 0 &&
    g.standings.every(s => (s.total?.games ?? 0) >= 3)
  );
  if (!allFinished) return null;

  const thirds = groups
    .map(g => {
      const third = (g.standings ?? [])[2];
      if (!third) return null;
      return {
        groupLetter: g.name.replace("Group ", ""),
        team: third.team,
        points: third.points ?? 0,
        sg: (third.total?.scoredGoals ?? 0) - (third.total?.receivedGoals ?? 0),
        goalsFor: third.total?.scoredGoals ?? 0,
      };
    })
    .filter(Boolean);

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.sg !== a.sg) return b.sg - a.sg;
    return b.goalsFor - a.goalsFor;
  });

  return thirds.slice(0, 8);
}

/**
 * Atribui os melhores 3os aos slots "3-XXXXX" do chaveamento.
 * Processa os slots em ordem, escolhendo gulosamente o melhor 3º elegível
 * (grupo na lista do slot) que ainda não foi alocado.
 */
function assignBestThirds(thirdSlots, bestThirds) {
  if (!bestThirds) return {};
  const assignment = {};
  const used = new Set();

  thirdSlots.forEach(slot => {
    const eligible = slot.replace("3-", "").split("");
    const pick = bestThirds.find(t =>
      eligible.includes(t.groupLetter) && !used.has(t.team?.id)
    );
    if (pick) {
      used.add(pick.team?.id);
      assignment[slot] = {
        name: getTeamName(pick.team),
        logo: pick.team?.logo,
        team: pick.team,
        confirmed: true,
      };
    }
  });

  return assignment;
}

function formatSlotLabel(slot) {
  if (slot.startsWith("3-")) {
    const g = slot.replace("3-", "").split("");
    return `3º (${g.join("/")})`;
  }
  return `${slot[0]}º ${slot[1]}`;
}

/** Um "time real" da Copa = tem id presente no mapa de tradução (placeholders não têm). */
function isRealTeam(team) {
  return !!(team && TEAM_NAMES_PT[team.id]);
}

function ChaveamentoView({ standings, fixtures = [], onSelectMatch }) {
  const groups = standings?.groups ?? [];

  // Jogos REAIS da Round of 32 vindos da API (só quando os dois times já estão definidos).
  // Enquanto a fase de grupos não termina, isso fica vazio → cai na projeção abaixo.
  const realR32 = useMemo(() => {
    return fixtures
      .filter(m => {
        const round = String(m.round ?? m.league?.round ?? "");
        if (!round.includes("Round of 32")) return false;
        const home = m.homeTeam ?? m.teams?.home;
        const away = m.awayTeam ?? m.teams?.away;
        return isRealTeam(home) && isRealTeam(away);
      })
      .sort((a, b) => {
        const da = new Date(getMatchDate(a) ?? 0) - new Date(getMatchDate(b) ?? 0);
        if (da !== 0) return da;
        return (a.id ?? 0) - (b.id ?? 0);
      });
  }, [fixtures]);

  // Bracket confirmado: usa os confrontos reais da API
  if (realR32.length > 0) {
    return (
      <div style={{ padding: "16px 0 24px" }}>
        <div style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 16,
          lineHeight: 1.6,
          background: "rgba(34,197,94,0.06)",
          borderRadius: 10,
          padding: "12px 14px",
          border: "1px solid rgba(34,197,94,0.18)",
        }}>
          <strong style={{ color: "#22c55e" }}>Round of 32 confirmada</strong>
          {" · Confrontos oficiais definidos pela FIFA. Toque em um jogo para ver os detalhes."}
        </div>

        {realR32.map(m => (
          <MatchCard key={getMatchId(m)} fixture={m} onClick={onSelectMatch} />
        ))}
      </div>
    );
  }

  // Campeões (1X) e vices (2X)
  const classified = {};
  groups.forEach(group => {
    const letter = group.name.replace("Group ", "");
    (group.standings ?? []).forEach((row, idx) => {
      const rank = idx + 1;
      if (rank === 1 || rank === 2) {
        classified[`${rank}${letter}`] = {
          name: getTeamName(row.team),
          logo: row.team?.logo,
          team: row.team,
          confirmed: (row.total?.games ?? 0) >= 3,
        };
      }
    });
  });

  // Melhores 3os (só após o fim de todos os grupos) → atribui aos slots "3-..."
  const bestThirds = getBestThirdPlaced(groups);
  const thirdSlots = BRACKET_R32
    .flatMap(b => [b.home, b.away])
    .filter(s => s.startsWith("3-"));
  const thirdAssignment = assignBestThirds(thirdSlots, bestThirds);

  function resolveSlot(slot) {
    if (slot.startsWith("3-")) return thirdAssignment[slot] ?? null;
    return classified[slot] ?? null;
  }

  return (
    <div style={{ padding: "16px 16px 24px" }}>
      <div style={{
        fontSize: 12,
        color: "rgba(255,255,255,0.55)",
        marginBottom: 16,
        lineHeight: 1.6,
        background: "rgba(245,158,11,0.06)",
        borderRadius: 10,
        padding: "12px 14px",
        border: "1px solid rgba(245,158,11,0.15)",
      }}>
        <strong style={{ color: "#fbbf24" }}>Round of 32</strong>
        {" · Primeira fase do mata-mata. 32 classificados: 12 campeões + 12 vices + 8 melhores 3os."}
      </div>

      {BRACKET_R32.map(({ jogo, home, away }) => (
        <div key={jogo} style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 8,
        }}>
          <div style={{
            fontSize: 10,
            color: "#f59e0b",
            fontWeight: 700,
            letterSpacing: "0.12em",
            marginBottom: 10,
          }}>JOGO {jogo}</div>

          <BracketSlot slot={home} team={resolveSlot(home)} divider />
          <BracketSlot slot={away} team={resolveSlot(away)} />
        </div>
      ))}
    </div>
  );
}

function BracketSlot({ slot, team, divider }) {
  const displaySlot = formatSlotLabel(slot);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 0",
      borderBottom: divider ? "1px solid rgba(255,255,255,0.06)" : "none",
    }}>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        color: "#f59e0b",
        background: "rgba(245,158,11,0.1)",
        borderRadius: 6,
        padding: "3px 7px",
        minWidth: 60,
        textAlign: "center",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>{displaySlot}</span>

      {team?.logo && (
        <img
          src={team.logo}
          alt=""
          style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}

      <span style={{
        fontSize: 14,
        fontWeight: team?.confirmed ? 700 : 400,
        color: team?.confirmed ? "#fff" : "rgba(255,255,255,0.4)",
        fontStyle: team?.confirmed ? "normal" : "italic",
        flex: 1,
        wordBreak: "break-word",
        overflowWrap: "break-word",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        minWidth: 0,
        lineHeight: 1.3,
      }}>
        {team ? getTeamName(team.team) : "A definir"}
      </span>

      {team?.confirmed && (
        <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>✓</span>
      )}
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
