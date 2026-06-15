import { useState, useEffect, useRef, useMemo } from "react";
import {
  getFixtures, getStandings, formatBrasilia, getMatchStatus,
  todayKeyBrasilia, getMatchDate
} from "@/services/worldcup";
import { BallIcon } from "@/components/icons/BallIcon.jsx";
import { MatchDetailModal } from "@/components/organisms/MatchDetailModal";

// Chaveamento oficial Copa 2026 — Round of 32
const BRACKET_R32 = [
  ["1A","2B"],["1C","2D"],["1E","2F"],["1G","2H"],
  ["1B","2A"],["1D","2C"],["1F","2E"],["1H","2G"],
  ["1I","2J"],["1K","2L"],["1J","2I"],["1L","2K"],
  ["3A","3B"],["3C","3D"],["3E","3F"],["3G","3H"],
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
        <ClassificacaoView standings={standings} />
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
    <div style={{ display: "flex", gap: 8, margin: "16px 16px 0", padding: 0 }}>
      {[
        { id: "cronograma", label: "Cronograma" },
        { id: "classificacao", label: "Classificação" },
      ].map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            flex: 1,
            padding: "12px 0",
            borderRadius: 12,
            border: tab === o.id
              ? "1px solid rgba(245,158,11,0.6)"
              : "1px solid rgba(255,255,255,0.1)",
            background: tab === o.id
              ? "linear-gradient(135deg, #f59e0b, #fbbf24)"
              : "rgba(255,255,255,0.04)",
            color: tab === o.id ? "#0c0c1a" : "rgba(255,255,255,0.6)",
            fontWeight: 700,
            fontSize: 14,
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

  const { todayMatches, futureGroups, pastGroups } = useMemo(() => {
    const todayMatches = [];
    const futureMap = {};
    const pastMap = {};

    fixtures.forEach(m => {
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
  }, [fixtures, todayKey]);

  const [showPast, setShowPast] = useState(false);

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
    <div style={{ padding: "20px 16px 0" }}>
      {/* HOJE */}
      {todayMatches.length > 0 && (
        <div ref={hojeRef} style={{ marginBottom: 28 }}>
          <SectionHeader label="HOJE" highlight />
          {todayMatches.map(m => <MatchCard key={getMatchId(m)} fixture={m} onClick={onSelectMatch} />)}
        </div>
      )}

      {/* PRÓXIMOS */}
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

      {/* PASSADOS (colapsável) */}
      {pastGroups.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setShowPast(!showPast)}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
            }}
          >
            <span>Jogos anteriores ({pastGroups.reduce((acc, g) => acc + g.items.length, 0)})</span>
            <span style={{
              transform: showPast ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
              fontSize: 16,
            }}>▾</span>
          </button>

          {showPast && (
            <div style={{ marginTop: 12 }}>
              {pastGroups.map(group => (
                <div key={group.key} style={{ marginBottom: 20 }}>
                  <SectionHeader label={group.label} muted />
                  {group.items.map(m => <MatchCard key={getMatchId(m)} fixture={m} onClick={onSelectMatch} />)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {todayMatches.length === 0 && futureGroups.length === 0 && pastGroups.length === 0 && (
        <EmptyState
          icon={<BallIcon size={56} color="rgba(255,255,255,0.3)" />}
          message="Nenhum jogo encontrado."
        />
      )}
    </div>
  );
}

function getMatchId(m) {
  return m.id ?? m.fixture?.id ?? getMatchDate(m);
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
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: highlight
          ? "#fff"
          : muted
            ? "rgba(255,255,255,0.3)"
            : "rgba(255,255,255,0.5)",
      }}>
        {label}
      </span>
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
  const homeName = homeTeam.name ?? "—";
  const awayName = awayTeam.name ?? "—";
  const homeLogo = homeTeam.logo;
  const awayLogo = awayTeam.logo;

  const homeScore = m.state?.score?.current?.[0]
    ?? m.homeScore ?? m.score?.home ?? m.goals?.home;
  const awayScore = m.state?.score?.current?.[1]
    ?? m.awayScore ?? m.score?.away ?? m.goals?.away;

  const hasScore = homeScore !== undefined && awayScore !== undefined && homeScore !== null;

  const round = m.round ?? m.group ?? m.league?.round ?? "";
  const roundLabel = formatRound(round);

  const homeWon = hasScore && Number(homeScore) > Number(awayScore);
  const awayWon = hasScore && Number(awayScore) > Number(homeScore);

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
        padding: "12px 14px",
        marginBottom: 8,
        boxShadow: isLive ? "0 4px 20px rgba(245,158,11,0.15)" : "none",
        cursor: "pointer",
        transition: "transform 0.15s",
      }}>
      {/* LINHA 1: Casa | Placar | Visitante */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 10,
        alignItems: "center",
        marginBottom: 8,
      }}>
        <TeamSide name={homeName} logo={homeLogo} align="right" won={isFinished && homeWon} />

        <div style={{ minWidth: 64, textAlign: "center", padding: "0 4px" }}>
          {hasScore ? (
            <div style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "0.02em",
            }}>
              {homeScore} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>–</span> {awayScore}
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "4px 0" }}>
              {time}
            </div>
          )}
        </div>

        <TeamSide name={awayName} logo={awayLogo} align="left" won={isFinished && awayWon} />
      </div>

      {/* LINHA 2: Status / Rodada (meta-info) */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        fontSize: 10,
        color: "rgba(255,255,255,0.45)",
        fontWeight: 600,
        letterSpacing: "0.05em",
      }}>
        {isLive && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            color: "#f59e0b",
            fontWeight: 700,
            fontSize: 10,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#f59e0b",
              boxShadow: "0 0 6px #f59e0b",
              animation: "pulse 1.5s ease-in-out infinite",
            }}/>
            {status.label}
          </span>
        )}
        {isFinished && <span style={{ textTransform: "uppercase" }}>Encerrado</span>}
        {roundLabel && (
          <>
            {(isLive || isFinished) && <span style={{ opacity: 0.4 }}>·</span>}
            <span style={{ textTransform: "uppercase" }}>{roundLabel}</span>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

function TeamSide({ name, logo, align, won }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: align === "right" ? "row" : "row-reverse",
      alignItems: "center",
      gap: 8,
      justifyContent: "flex-end",
      minWidth: 0,
    }}>
      <span style={{
        fontSize: 13,
        fontWeight: won ? 800 : 600,
        color: won ? "#fff" : "rgba(255,255,255,0.85)",
        textAlign: align,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        minWidth: 0,
        flex: 1,
      }}>{name}</span>
      {logo && (
        <img
          src={logo}
          alt=""
          style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0 }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
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
function ClassificacaoView({ standings }) {
  const [view, setView] = useState("grupos");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, padding: "16px 16px 0", flexWrap: "wrap" }}>
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

      {view === "grupos" && <GruposView standings={standings} />}
      {view === "chaveamento" && <ChaveamentoView standings={standings} />}
    </div>
  );
}

/* ============== GRUPOS ============== */
function GruposView({ standings }) {
  const groups = standings?.groups ?? [];

  return (
    <div style={{ padding: "16px 16px 0" }}>
      {groups.map((group, idx) => (
        <div key={idx} style={{ marginBottom: 24 }}>
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

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 26px 26px 26px 26px 32px 36px",
            gap: 4,
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            fontWeight: 600,
            padding: "0 12px 6px",
            letterSpacing: "0.05em",
          }}>
            {["Time","J","V","E","D","SG","Pts"].map(h => (
              <span key={h} style={{ textAlign: h === "Time" ? "left" : "center" }}>{h}</span>
            ))}
          </div>

          {(group.standings ?? []).map((row, tIdx) => {
            const advances = tIdx < 2;
            const t = row.total ?? {};
            const sg = (t.scoredGoals ?? 0) - (t.receivedGoals ?? 0);

            return (
              <div key={row.team?.id ?? tIdx} style={{
                display: "grid",
                gridTemplateColumns: "1fr 26px 26px 26px 26px 32px 36px",
                gap: 4,
                background: tIdx % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                borderRadius: 8,
                padding: "10px 12px",
                borderLeft: advances
                  ? "2px solid rgba(34,197,94,0.6)"
                  : "2px solid transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    minWidth: 14,
                    color: advances ? "#22c55e" : "rgba(255,255,255,0.4)",
                  }}>{row.position ?? tIdx + 1}</span>
                  {row.team?.logo && (
                    <img
                      src={row.team.logo}
                      alt=""
                      style={{ width: 18, height: 18, objectFit: "contain" }}
                      onError={e => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>{row.team?.name}</span>
                </div>
                <span style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{t.games ?? 0}</span>
                <span style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{t.wins ?? 0}</span>
                <span style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{t.draws ?? 0}</span>
                <span style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{t.loses ?? 0}</span>
                <span style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{sg > 0 ? `+${sg}` : sg}</span>
                <span style={{
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  color: advances ? "#22c55e" : "#fff",
                }}>{row.points ?? 0}</span>
              </div>
            );
          })}
        </div>
      ))}

      <div style={{
        display: "flex",
        gap: 16,
        padding: "4px 12px 24px",
        fontSize: 11,
        color: "rgba(255,255,255,0.4)",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 10, height: 10, borderRadius: 2,
            background: "rgba(34,197,94,0.6)", display: "inline-block",
          }}/>
          Classificados (top 2)
        </span>
      </div>
    </div>
  );
}

/* ============== CHAVEAMENTO ============== */
function ChaveamentoView({ standings }) {
  const groups = standings?.groups ?? [];

  const classified = {};
  groups.forEach(group => {
    const letter = group.name.replace("Group ", "");
    (group.standings ?? []).forEach((row, idx) => {
      const rank = idx + 1;
      if (rank <= 3) {
        classified[`${rank}${letter}`] = {
          name: row.team?.name,
          logo: row.team?.logo,
          confirmed: (row.total?.games ?? 0) >= 3,
        };
      }
    });
  });

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
        <strong style={{ color: "#fbbf24" }}>✓ Confirmado</strong>
        {" = 3 jogos disputados. "}
        <strong style={{ color: "rgba(255,255,255,0.7)" }}>Projeção</strong>
        {" = baseada na classificação atual."}
      </div>

      {BRACKET_R32.map(([slot1, slot2], idx) => {
        const t1 = classified[slot1];
        const t2 = classified[slot2];

        return (
          <div key={idx} style={{
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
            }}>JOGO {idx + 1}</div>

            {[{slot: slot1, team: t1}, {slot: slot2, team: t2}].map(({slot, team}, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#f59e0b",
                  background: "rgba(245,158,11,0.1)",
                  borderRadius: 6,
                  padding: "3px 7px",
                  minWidth: 30,
                  textAlign: "center",
                }}>{slot}</span>

                {team?.logo && (
                  <img
                    src={team.logo}
                    alt=""
                    style={{ width: 20, height: 20, objectFit: "contain" }}
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                )}

                <span style={{
                  fontSize: 14,
                  fontWeight: team?.confirmed ? 700 : 400,
                  color: team?.confirmed ? "#fff" : "rgba(255,255,255,0.4)",
                  fontStyle: team?.confirmed ? "normal" : "italic",
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {team?.name ?? "A definir"}
                </span>

                {team?.confirmed && (
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>✓</span>
                )}
                {team && !team.confirmed && (
                  <span style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.4)",
                    background: "rgba(255,255,255,0.05)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}>PROJ.</span>
                )}
              </div>
            ))}
          </div>
        );
      })}
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
