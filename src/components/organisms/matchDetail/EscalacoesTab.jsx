import { useState, useEffect } from "react";
import { getLineups } from "@/services/worldcup";
import { LoadingTab, EmptyTab, SectionLabel } from "@/components/organisms/matchDetail/_shared";

/* Escalações (titulares + reservas + formação) */
export function EscalacoesTab({ match }) {
  const [lineups, setLineups] = useState(null);

  useEffect(() => {
    getLineups(match.id ?? match.fixture?.id)
      .then(d => setLineups(d?.data ?? d ?? []))
      .catch(() => setLineups([]));
  }, [match.id, match.fixture?.id]);

  if (lineups === null) return <LoadingTab />;
  if (!lineups.length) return <EmptyTab message="Escalações ainda não disponíveis." />;

  return (
    <div>
      {lineups.map((teamLineup, idx) => (
        <div key={idx} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            {teamLineup.team?.logo && (
              <img src={teamLineup.team.logo} style={{ width: 22, height: 22 }} alt="" />
            )}
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {teamLineup.team?.name}
            </span>
            {teamLineup.formation && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#fbbf24",
                background: "rgba(245,158,11,0.1)",
                padding: "3px 8px",
                borderRadius: 6,
                flexShrink: 0,
              }}>{teamLineup.formation}</span>
            )}
          </div>

          <SectionLabel>Titulares</SectionLabel>
          {(teamLineup.startXI ?? teamLineup.initialLineup ?? []).map((p, i) => (
            <PlayerRow key={i} player={p.player ?? p} />
          ))}

          {(teamLineup.substitutes ?? teamLineup.bench ?? []).length > 0 && (
            <>
              <SectionLabel style={{ marginTop: 14 }}>Reservas</SectionLabel>
              {(teamLineup.substitutes ?? teamLineup.bench).map((p, i) => (
                <PlayerRow key={i} player={p.player ?? p} muted />
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function PlayerRow({ player, muted }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "32px 1fr 40px",
      gap: 10,
      padding: "8px 4px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      alignItems: "center",
    }}>
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        color: muted ? "rgba(255,255,255,0.3)" : "#f59e0b",
        textAlign: "center",
      }}>{player?.number ?? "—"}</span>
      <span style={{
        fontSize: 13,
        color: muted ? "rgba(255,255,255,0.5)" : "#fff",
        fontWeight: muted ? 400 : 600,
        minWidth: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>{player?.name ?? "—"}</span>
      <span style={{
        fontSize: 10,
        color: "rgba(255,255,255,0.35)",
        textAlign: "right",
        textTransform: "uppercase",
      }}>{player?.pos ?? player?.position ?? ""}</span>
    </div>
  );
}
