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
        const code = f.n === "00" ? "FWC00" : `FWC${f.n}`;
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
  const [sortTeams, setSortTeams] = useState("pct");

  const groups = ["Todos", ...new Set(TEAMS.map((t) => t.grp)), "Extras"];

  const sortedFilteredTeams = useMemo(() => {
    const filtered = TEAMS.filter(
      (t) =>
        (grp === "Todos" || t.grp === grp) &&
        (!search.trim() ||
          t.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          t.id.toLowerCase().includes(search.trim().toLowerCase()))
    );
    return [...filtered].sort((a, b) => {
      if (sortTeams === "name") return a.name.localeCompare(b.name, "pt-BR");
      if (sortTeams === "group") return a.grp.localeCompare(b.grp) || a.name.localeCompare(b.name, "pt-BR");
      const tsA = stickers.filter((s) => s.team === a.id);
      const tsB = stickers.filter((s) => s.team === b.id);
      const pctA = tsA.filter((s) => s.status === "Tenho").length / (tsA.length || 1);
      const pctB = tsB.filter((s) => s.status === "Tenho").length / (tsB.length || 1);
      return pctB - pctA;
    });
  }, [stickers, grp, search, sortTeams]);

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

      {/* Chips de ordenação */}
      <div style={{ overflowX: "auto", overflowY: "visible", paddingBottom: 4, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 5, paddingTop: 5, width: "max-content", overflow: "visible" }}>
          {[
            { id: "pct",   label: "% Completo" },
            { id: "name",  label: "Nome A-Z" },
            { id: "group", label: "Grupo" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortTeams(opt.id)}
              className="fc-btn"
              style={{
                background: sortTeams === opt.id ? C.amberDim : C.surface,
                border: `1px solid ${sortTeams === opt.id ? C.amber + "66" : C.border}`,
                color: sortTeams === opt.id ? C.amber : C.t2,
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
                flexShrink: 0,
                transition: "all .18s ease",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
      <div style={{ overflowX: "auto", overflowY: "visible", paddingBottom: 4, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 5, paddingTop: 5, width: "max-content", overflow: "visible" }}>
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
      </div>

      {grp === "Extras" ? (
        <div>
          <FWCExtrasGrid stickers={stickers} />

          {/* Seção Coca-Cola */}
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: C.t2,
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
            }}>
              🥤 Coca-Cola
              <span style={{ fontSize: 11, color: C.t3, fontWeight: 400 }}>
                ({stickers.filter((s) => s.team === "CC" && s.status === "Tenho").length}/14)
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stickers.filter((s) => s.team === "CC").map((s) => {
                const owned = s.status === "Tenho";
                const dup = s.status === "Repetida";
                return (
                  <div
                    key={s.code}
                    onClick={() => { setTeamFilter("CC"); setPage("stickers"); }}
                    style={{
                      background: C.surface,
                      border: `1px solid ${owned || dup ? "#f4000944" : C.border}`,
                      borderRadius: 12, padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 12,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#f40009", minWidth: 44, fontWeight: 700 }}>
                      {s.code}
                    </span>
                    <span style={{ fontSize: 13, color: "#fff", flex: 1 }}>{s.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 8px",
                      background: owned ? C.greenDim : dup ? C.amberDim : C.redDim,
                      color: owned ? C.green : dup ? C.amber : C.red, flexShrink: 0,
                    }}>
                      {owned ? "Tenho" : dup ? "Repetida" : "Falta"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {sortedFilteredTeams.map((team) => (
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
