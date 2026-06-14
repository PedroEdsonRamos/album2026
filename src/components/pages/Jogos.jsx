import { useState, useEffect } from "react";
import { getFixtures, getStandings, formatBrasilia, getMatchStatus, getScore } from "@/services/worldcup";

// Chaveamento oficial Copa 2026 — Round of 32 (12 grupos, top-2 + 8 melhores terceiros)
const BRACKET_R32 = [
  ["1A","2B"],["1C","2D"],["1E","2F"],["1G","2H"],
  ["1B","2A"],["1D","2C"],["1F","2E"],["1H","2G"],
  ["1I","2J"],["1K","2L"],["1J","2I"],["1L","2K"],
  ["3A","3B"],["3C","3D"],["3E","3F"],["3G","3H"],
];

function formatRound(round) {
  return (round ?? "")
    .replace("Group Stage - ", "J")
    .replace("Round of ", "R")
    .replace("Quarter-finals", "QF")
    .replace("Semi-finals", "SF")
    .replace("3rd Place Final", "3°")
    .replace("Final", "FIN");
}

// Letra do grupo (A–L) a partir do nome vindo da Highlightly ("... Group A"),
// com fallback pela ordem (12 grupos da Copa vêm em ordem A→L).
function groupLetter(group, idx) {
  const match = (group?.name ?? "").match(/group\s+([a-l])/i);
  return (match ? match[1] : String.fromCharCode(65 + idx)).toUpperCase();
}

export function Jogos() {
  const [tab, setTab] = useState("cronograma");
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div style={{ minHeight: "100vh", background: "#0c0c1a", color: "#fff", paddingBottom: 80 }}>
      <SegmentedControl tab={tab} onChange={setTab} />
      {loading && <Loading />}
      {error && <ErrorState msg={error} onRetry={load} />}
      {!loading && !error && tab === "cronograma" && <CronogramaView fixtures={fixtures} />}
      {!loading && !error && tab === "classificacao" && <ClassificacaoView standings={standings} fixtures={fixtures} />}
    </div>
  );
}

function SegmentedControl({ tab, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 8, margin: "16px 16px 0", padding: 0,
    }}>
      {[{ id: "cronograma", label: "Cronograma" }, { id: "classificacao", label: "Classificação" }].map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          flex: 1, padding: "12px 0", borderRadius: 12,
          border: tab === o.id ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.12)",
          background: tab === o.id ? "linear-gradient(135deg, #f59e0b, #fbbf24)" : "rgba(255,255,255,0.04)",
          color: tab === o.id ? "#000" : "rgba(255,255,255,0.6)",
          fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          transition: "all 0.2s",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function CronogramaView({ fixtures }) {
  const todayKey = formatBrasilia(new Date().toISOString()).dateKey;

  const grouped = {};
  fixtures.forEach(f => {
    const { dateKey, date } = formatBrasilia(f.date);
    if (!grouped[dateKey]) grouped[dateKey] = { label: date, items: [] };
    grouped[dateKey].items.push(f);
  });

  return (
    <div style={{ padding: "16px 16px 0" }}>
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, { label, items }]) => {
          const isToday = dateKey === todayKey;
          return (
            <div key={dateKey} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: isToday ? "#f59e0b" : "rgba(255,255,255,0.4)",
                letterSpacing: "0.12em", textTransform: "uppercase",
                marginBottom: 10, paddingLeft: 4,
              }}>
                {isToday ? "HOJE — " : ""}{label}
              </div>
              {items
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(f => <MatchCard key={f.id} fixture={f} />)
              }
            </div>
          );
        })}
    </div>
  );
}

function MatchCard({ fixture: m }) {
  const { time } = formatBrasilia(m.date);
  const status = getMatchStatus(m);
  const isLive = status.type === "live";
  const isFinished = status.type === "finished";
  const { home: hg, away: ag } = getScore(m);

  return (
    <div style={{
      background: isLive ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${isLive ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16, padding: "14px 16px", marginBottom: 8,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        minWidth: 52, textAlign: "center", fontSize: 13, fontWeight: 700,
        color: isLive ? "#f59e0b" : isFinished ? "rgba(255,255,255,0.4)" : "#fff",
      }}>
        {isFinished ? "FIM" : isLive ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            {status.label}
          </span>
        ) : time}
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{m.homeTeam?.name ?? "—"}</div>
        </div>
        <div style={{
          minWidth: 64, textAlign: "center",
          fontSize: (isFinished || isLive) ? 20 : 14, fontWeight: 800,
          color: (isFinished || isLive) ? "#fff" : "rgba(255,255,255,0.25)",
        }}>
          {(isFinished || isLive) ? `${hg ?? 0} – ${ag ?? 0}` : "×"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{m.awayTeam?.name ?? "—"}</div>
        </div>
      </div>

      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, minWidth: 32, textAlign: "right" }}>
        {formatRound(m.round)}
      </div>
    </div>
  );
}

function ClassificacaoView({ standings, fixtures }) {
  const [view, setView] = useState("grupos");
  const groups = standings ?? [];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, padding: "16px 16px 0" }}>
        {[{ id: "grupos", label: "Grupos" }, { id: "chaveamento", label: "Chaveamento" }].map(o => (
          <button key={o.id} onClick={() => setView(o.id)} style={{
            padding: "8px 20px", borderRadius: 999,
            background: view === o.id ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
            border: view === o.id ? "1px solid rgba(245,158,11,0.4)" : "1px solid transparent",
            color: view === o.id ? "#f59e0b" : "rgba(255,255,255,0.5)",
            fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>{o.label}</button>
        ))}
      </div>
      {view === "grupos" && <GruposView groups={groups} />}
      {view === "chaveamento" && <ChaveamentoView groups={groups} fixtures={fixtures} />}
    </div>
  );
}

function GruposView({ groups }) {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      {groups.map((group, idx) => (
        <div key={idx} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: "0.15em",
            color: "#f59e0b", textTransform: "uppercase", marginBottom: 8,
          }}>
            {`Group ${groupLetter(group, idx)}`}
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 26px 26px 26px 26px 30px 34px",
            gap: 4, fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600,
            padding: "0 12px 6px", letterSpacing: "0.05em",
          }}>
            {["Time", "J", "V", "E", "D", "SG", "Pts"].map(h => (
              <span key={h} style={{ textAlign: h === "Time" ? "left" : "center" }}>{h}</span>
            ))}
          </div>
          {(group.standings ?? []).map((row, tIdx) => {
            const advances = tIdx < 2;
            const t = row.total ?? {};
            const gd = (t.scoredGoals ?? 0) - (t.receivedGoals ?? 0);
            return (
              <div key={row.team?.id ?? tIdx} style={{
                display: "grid", gridTemplateColumns: "1fr 26px 26px 26px 26px 30px 34px",
                gap: 4,
                background: tIdx % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                borderRadius: 8, padding: "10px 12px",
                borderLeft: advances ? "2px solid rgba(34,197,94,0.5)" : "2px solid transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, minWidth: 14,
                    color: advances ? "#22c55e" : "rgba(255,255,255,0.35)",
                  }}>{tIdx + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{row.team?.name}</span>
                </div>
                {[t.games, t.wins, t.draws, t.loses,
                  (gd > 0 ? `+${gd}` : gd),
                ].map((v, i) => (
                  <span key={i} style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{v}</span>
                ))}
                <span style={{
                  textAlign: "center", fontSize: 14, fontWeight: 800,
                  color: advances ? "#22c55e" : "#fff",
                }}>{row.points}</span>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{
        display: "flex", gap: 16, padding: "4px 12px 24px",
        fontSize: 11, color: "rgba(255,255,255,0.4)",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(34,197,94,0.5)", display: "inline-block" }} />
          Classificados diretos (top 2)
        </span>
      </div>
    </div>
  );
}

function ChaveamentoView({ groups }) {
  const classified = {};
  groups.forEach((group, gIdx) => {
    const letter = groupLetter(group, gIdx);
    (group.standings ?? []).forEach((row, idx) => {
      const rank = idx + 1;
      if (rank <= 3) {
        classified[`${rank}${letter}`] = {
          name: row.team?.name,
          confirmed: (row.total?.games ?? 0) >= 3,
          points: row.points,
        };
      }
    });
  });

  return (
    <div style={{ padding: "16px 16px 24px" }}>
      <div style={{
        fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16, lineHeight: 1.6,
        background: "rgba(245,158,11,0.06)", borderRadius: 10, padding: "10px 14px",
        border: "1px solid rgba(245,158,11,0.15)",
      }}>
        ✓ Confirmado = 3 jogos disputados · Projeção = classificação atual
      </div>
      {BRACKET_R32.map(([slot1, slot2], idx) => {
        const t1 = classified[slot1];
        const t2 = classified[slot2];
        return (
          <div key={idx} style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "12px 16px", marginBottom: 8,
          }}>
            <div style={{
              fontSize: 10, color: "#f59e0b", fontWeight: 700,
              letterSpacing: "0.1em", marginBottom: 8,
            }}>JOGO {idx + 1}</div>
            {[{ slot: slot1, team: t1 }, { slot: slot2, team: t2 }].map(({ slot, team }, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#f59e0b",
                  background: "rgba(245,158,11,0.1)", borderRadius: 6,
                  padding: "2px 6px", minWidth: 28, textAlign: "center",
                }}>{slot}</span>
                <span style={{
                  fontSize: 14, fontWeight: team?.confirmed ? 700 : 400,
                  color: team?.confirmed ? "#fff" : "rgba(255,255,255,0.4)",
                  fontStyle: team?.confirmed ? "normal" : "italic", flex: 1,
                }}>
                  {team?.name ?? "A definir"}
                </span>
                {team?.confirmed
                  ? <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>✓</span>
                  : team
                    ? <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>proj.</span>
                    : null
                }
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Loading() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "50vh", gap: 16,
    }}>
      <div style={{ fontSize: 48 }}>⚽</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
        Carregando dados da Copa...
      </div>
    </div>
  );
}

function ErrorState({ msg, onRetry }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "48px 24px", gap: 16,
    }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{msg}</div>
      <button onClick={onRetry} style={{
        background: "#f59e0b", color: "#000", border: "none", borderRadius: 10,
        padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      }}>Tentar novamente</button>
    </div>
  );
}
