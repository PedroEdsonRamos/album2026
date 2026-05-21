import { useState, useMemo } from "react";
import { ALL_TEAMS } from "@/data/teams.js";
import { TeamCard } from "@/components/molecules/TeamCard.jsx";
import { C } from "@/styles/tokens.js";

export function Teams({ stickers, setPage, setTeamFilter }) {
  const [grp, setGrp] = useState("Todos");
  const groups = ["Todos", ...new Set(ALL_TEAMS.map((t) => t.grp))];
  const filteredTeams = useMemo(
    () => ALL_TEAMS.filter((t) => grp === "Todos" || t.grp === grp),
    [grp]
  );

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: C.t2,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 14,
        }}
      >
        🌍 48 Seleções · Copa 2026
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 8,
          marginBottom: 14,
        }}
      >
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGrp(g)}
            className="fc-btn"
            style={{
              background: grp === g ? C.amberDim : C.surface,
              border: `1px solid ${grp === g ? C.amber + "66" : C.border}`,
              color: grp === g ? C.amber : C.t2,
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
              transition: "all .18s ease",
            }}
          >
            {g === "Todos" ? "Todos" : g === "Extras" ? "Extras" : `Grupo ${g}`}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {filteredTeams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            stickers={stickers}
            onSelect={() => {
              setTeamFilter(team.id);
              setPage("stickers");
            }}
          />
        ))}
      </div>
    </div>
  );
}
