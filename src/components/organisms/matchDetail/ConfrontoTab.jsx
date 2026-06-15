import { useState, useEffect } from "react";
import { getHeadToHead, getLastFiveGames, getMatchDate } from "@/services/worldcup";
import { LoadingTab, SectionLabel } from "@/components/organisms/matchDetail/_shared";

/* Confronto direto + forma recente (jogo futuro) */
export function ConfrontoTab({ match }) {
  const homeId = match.homeTeam?.id ?? match.teams?.home?.id;
  const awayId = match.awayTeam?.id ?? match.teams?.away?.id;

  const [h2h, setH2h] = useState(null);
  const [homeForm, setHomeForm] = useState(null);
  const [awayForm, setAwayForm] = useState(null);

  useEffect(() => {
    if (!homeId || !awayId) return;
    Promise.all([
      getHeadToHead(homeId, awayId).catch(() => null),
      getLastFiveGames(homeId).catch(() => null),
      getLastFiveGames(awayId).catch(() => null),
    ]).then(([h, hf, af]) => {
      setH2h(h?.data ?? h ?? []);
      setHomeForm(hf?.data ?? hf ?? []);
      setAwayForm(af?.data ?? af ?? []);
    });
  }, [homeId, awayId]);

  if (h2h === null) return <LoadingTab message="Carregando histórico..." />;

  return (
    <div>
      <SectionLabel>Forma recente</SectionLabel>
      <FormRow team={match.homeTeam ?? match.teams?.home} games={homeForm ?? []} />
      <FormRow team={match.awayTeam ?? match.teams?.away} games={awayForm ?? []} />

      {h2h.length > 0 && (
        <>
          <SectionLabel style={{ marginTop: 24 }}>Últimos confrontos</SectionLabel>
          {h2h.slice(0, 5).map((g, idx) => (
            <H2HRow key={idx} game={g} />
          ))}
        </>
      )}
    </div>
  );
}

function FormRow({ team, games }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 0",
    }}>
      {team?.logo && (
        <img src={team.logo} style={{ width: 22, height: 22, objectFit: "contain" }} alt="" />
      )}
      <span style={{ fontSize: 13, color: "#fff", flex: 1, fontWeight: 600 }}>{team?.name}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {games.slice(0, 5).map((g, idx) => {
          const result = getGameResultLetter(g, team?.id);
          const colors = {
            "V": { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
            "E": { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
            "D": { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
          };
          const c = colors[result] ?? { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" };
          return (
            <span key={idx} style={{
              width: 22, height: 22,
              borderRadius: 6,
              background: c.bg,
              color: c.color,
              fontSize: 11,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>{result}</span>
          );
        })}
      </div>
    </div>
  );
}

function getGameResultLetter(game, teamId) {
  const isHome = (game.homeTeam?.id ?? game.teams?.home?.id) === teamId;
  const homeScore = game.homeScore ?? game.goals?.home ?? game.state?.score?.current?.[0];
  const awayScore = game.awayScore ?? game.goals?.away ?? game.state?.score?.current?.[1];
  if (homeScore === awayScore) return "E";
  const teamWon = isHome ? homeScore > awayScore : awayScore > homeScore;
  return teamWon ? "V" : "D";
}

function H2HRow({ game }) {
  const home = game.homeTeam?.name ?? game.teams?.home?.name;
  const away = game.awayTeam?.name ?? game.teams?.away?.name;
  const hs = game.homeScore ?? game.goals?.home ?? game.state?.score?.current?.[0];
  const as_ = game.awayScore ?? game.goals?.away ?? game.state?.score?.current?.[1];
  const dateStr = getMatchDate(game);
  const year = dateStr ? new Date(dateStr).getFullYear() : "";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr 40px",
      gap: 8,
      padding: "8px 4px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      alignItems: "center",
      fontSize: 12,
    }}>
      <span style={{ color: "rgba(255,255,255,0.7)", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{home}</span>
      <span style={{
        fontWeight: 800,
        color: "#fff",
        background: "rgba(255,255,255,0.05)",
        padding: "3px 8px",
        borderRadius: 6,
      }}>{hs}–{as_}</span>
      <span style={{ color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{away}</span>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{year}</span>
    </div>
  );
}
