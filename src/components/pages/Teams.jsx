import { useState, useMemo } from "react";
import { TEAMS } from "@/data/teams.js";
import { FWC_LIST } from "@/data/fwc.js";
import { TeamCard } from "@/components/molecules/TeamCard.jsx";
import { Icon } from "@/components/atoms/Icon.jsx";
import { C } from "@/styles/tokens.js";

function FWCExtrasGrid({ stickers }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {FWC_LIST.map((f) => {
        const code = f.n === "00" ? "00" : `FWC ${f.n}`;
        const s = stickers.find((x) => x.code === code);
        const owned = s?.status === "Tenho";
        const dup = s?.status === "Repetida";
        return (
          <div
            key={code}
            style={{
              background: C.surface,
              border: `1px solid ${owned || dup ? C.amber + "44" : C.border}`,
              borderRadius: 12,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                color: C.amber,
                minWidth: 44,
                fontWeight: 700,
              }}
            >
              {code}
            </span>
            <span style={{ fontSize: 13, color: "#fff", flex: 1 }}>{f.name}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 999,
                padding: "2px 8px",
                background: owned ? C.greenDim : dup ? C.amberDim : C.redDim,
                color: owned ? C.green : dup ? C.amber : C.red,
                flexShrink: 0,
              }}
            >
              {owned ? "Tenho" : dup ? "Repetida" : "Falta"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Teams({ stickers, setPage, setTeamFilter }) {
  const [grp, setGrp] = useState("Todos");
  const [search, setSearch] = useState("");

  const groups = ["Todos", ...new Set(TEAMS.map((t) => t.grp)), "Extras"];

  const filteredTeams = useMemo(
    () =>
      TEAMS.filter(
        (t) =>
          (grp === "Todos" || t.grp === grp) &&
          (!search.trim() ||
            t.name.toLowerCase().includes(search.trim().toLowerCase()) ||
            t.id.toLowerCase().includes(search.trim().toLowerCase()))
      ),
    [grp, search]
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

      {/* Campo de busca */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <div
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: C.t3,
            lineHeight: 0,
          }}
        >
          <Icon name="search" size={15} />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar seleção..."
          style={{
            width: "100%",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "10px 14px 10px 36px",
            color: "#fff",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Chips de grupo */}
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

      {grp === "Extras" ? (
        <FWCExtrasGrid stickers={stickers} />
      ) : (
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
      )}
    </div>
  );
}
