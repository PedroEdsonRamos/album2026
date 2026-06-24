import { useMemo } from "react";
import { BRACKET_ROUNDS, slotLabel } from "@/data/bracketMap.js";
import { getTeamName, TEAM_NAMES_PT } from "@/data/teamsTranslation";
import { extractScore } from "@/services/worldcup";

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

/** Um "time real" da Copa = tem id presente no mapa de tradução (placeholders não têm). */
function isRealTeam(team) {
  return !!(team && TEAM_NAMES_PT[team.id]);
}

/** Chave de par de times (independente da ordem mandante/visitante). */
function pairKey(a, b) {
  return [a, b].sort().join("-");
}

/** Round que não é fase de grupos. */
function isKnockoutFixture(m) {
  const round = String(m.round ?? m.league?.round ?? "").toLowerCase();
  return round && !round.includes("group");
}

const COLUMN_ORDER = ["r32", "r16", "qf", "sf", "final"];

export function ChaveamentoView({ standings, fixtures = [], onSelectMatch }) {
  const groups = standings?.groups ?? [];

  const byId = useMemo(
    () => Object.fromEntries(BRACKET_ROUNDS.map(r => [r.id, r])),
    []
  );

  // Campeões (1X) e vices (2X) a partir da classificação dos grupos.
  const classified = useMemo(() => {
    const out = {};
    groups.forEach(group => {
      const letter = group.name.replace("Group ", "");
      (group.standings ?? []).forEach((row, idx) => {
        const rank = idx + 1;
        if (rank === 1 || rank === 2) {
          out[`${rank}${letter}`] = {
            name: getTeamName(row.team),
            logo: row.team?.logo,
            team: row.team,
            confirmed: (row.total?.games ?? 0) >= 3,
          };
        }
      });
    });
    return out;
  }, [groups]);

  // Melhores 3os (só após o fim de todos os grupos) → atribui aos slots "3-...".
  const thirdAssignment = useMemo(() => {
    const bestThirds = getBestThirdPlaced(groups);
    const thirdSlots = byId.r32.matches
      .flatMap(m => [m.home, m.away])
      .map(s => s.slot)
      .filter(s => s && s.startsWith("3-"));
    return assignBestThirds(thirdSlots, bestThirds);
  }, [groups, byId]);

  // Jogos reais do mata-mata vindos da API, indexados pelo par de times.
  // Permite mostrar placar e abrir o detalhe quando os dois times já estão definidos.
  const realByPair = useMemo(() => {
    const map = new Map();
    fixtures.forEach(m => {
      if (!isKnockoutFixture(m)) return;
      const home = m.homeTeam ?? m.teams?.home;
      const away = m.awayTeam ?? m.teams?.away;
      if (isRealTeam(home) && isRealTeam(away)) {
        map.set(pairKey(home.id, away.id), m);
      }
    });
    return map;
  }, [fixtures]);

  function resolveSlot(slot) {
    if (slot.startsWith("3-")) return thirdAssignment[slot] ?? null;
    return classified[slot] ?? null;
  }

  /** Resolve uma ponta para { team,name,logo,confirmed } (real) ou { label } (estrutural). */
  function resolveSide(side) {
    if (side?.slot) {
      const team = resolveSlot(side.slot);
      if (team) return team;
    }
    return { label: slotLabel(side) };
  }

  function findRealFixture(homeTeam, awayTeam) {
    if (!homeTeam?.id || !awayTeam?.id) return null;
    return realByPair.get(pairKey(homeTeam.id, awayTeam.id)) ?? null;
  }

  const third = byId.third;

  const renderMatch = (m) => (
    <BracketMatchCard
      key={m.n}
      match={m}
      home={resolveSide(m.home)}
      away={resolveSide(m.away)}
      findRealFixture={findRealFixture}
      onSelectMatch={onSelectMatch}
    />
  );

  return (
    <div style={{ padding: "16px 0 24px" }}>
      <div style={{
        fontSize: 12,
        color: "rgba(255,255,255,0.55)",
        margin: "0 16px 16px",
        lineHeight: 1.6,
        background: "rgba(245,158,11,0.06)",
        borderRadius: 10,
        padding: "12px 14px",
        border: "1px solid rgba(245,158,11,0.15)",
      }}>
        <strong style={{ color: "#fbbf24" }}>Chaveamento completo</strong>
        {" · Role para o lado para ver todas as fases até a final. Os caminhos futuros aparecem como “Vencedor jogo X”."}
      </div>

      {/* Árvore: uma coluna por rodada, com scroll horizontal */}
      <div style={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        padding: "0 16px 10px",
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: "min-content" }}>
          {COLUMN_ORDER.map(id => {
            const round = byId[id];
            return (
              <div key={id} style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: 170,
                flexShrink: 0,
              }}>
                <ColumnHeader label={round.label} />
                {round.matches.map(renderMatch)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disputa de 3º lugar (à parte) */}
      <div style={{ padding: "8px 16px 0" }}>
        <ColumnHeader label={third.label} />
        <div style={{ maxWidth: 240 }}>
          {third.matches.map(renderMatch)}
        </div>
      </div>
    </div>
  );
}

function ColumnHeader({ label }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.14em",
      color: "#f59e0b",
      textTransform: "uppercase",
      marginBottom: 2,
      whiteSpace: "nowrap",
    }}>
      {label}
    </div>
  );
}

function BracketMatchCard({ match, home, away, findRealFixture, onSelectMatch }) {
  const bothReal = !home.label && !away.label;
  const realFixture = bothReal ? findRealFixture(home.team, away.team) : null;

  const score = realFixture ? extractScore(realFixture) : null;
  const homeWon = !!score && Number(score.home) > Number(score.away);
  const awayWon = !!score && Number(score.away) > Number(score.home);
  const clickable = !!realFixture;

  return (
    <div
      onClick={clickable ? () => onSelectMatch?.(realFixture) : undefined}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "8px 10px",
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <div style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: "#f59e0b",
        marginBottom: 4,
      }}>JOGO {match.n}</div>

      <BracketLine res={home} score={score?.home} won={homeWon} divider />
      <BracketLine res={away} score={score?.away} won={awayWon} />
    </div>
  );
}

function BracketLine({ res, score, won, divider }) {
  const isTeam = !res.label;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 7,
      padding: "6px 0",
      borderBottom: divider ? "1px solid rgba(255,255,255,0.06)" : "none",
    }}>
      {isTeam && res.logo && (
        <img
          src={res.logo}
          alt=""
          style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}

      <span style={{
        flex: 1,
        minWidth: 0,
        fontSize: 12,
        lineHeight: 1.25,
        fontWeight: isTeam ? (res.confirmed ? 800 : 600) : 500,
        color: isTeam
          ? (res.confirmed ? "#fff" : "rgba(255,255,255,0.8)")
          : "rgba(255,255,255,0.45)",
        fontStyle: isTeam ? "normal" : "italic",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {isTeam ? (res.name ?? getTeamName(res.team)) : res.label}
      </span>

      {score != null && (
        <span style={{
          fontSize: 13,
          fontWeight: 800,
          color: won ? "#fff" : "rgba(255,255,255,0.6)",
          flexShrink: 0,
        }}>{score}</span>
      )}
    </div>
  );
}
