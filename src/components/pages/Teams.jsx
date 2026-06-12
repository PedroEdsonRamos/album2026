import { useState, useMemo, useEffect } from "react";
import { usePersistedFilter } from "@/hooks/usePersistedFilter.js";
import { TEAMS } from "@/data/teams.js";
import { ES_PLAYERS, ES_RARITY_TYPES } from "@/data/extraStickers.js";
import { TeamCard } from "@/components/molecules/TeamCard.jsx";
import { StickerCard } from "@/components/molecules/StickerCard.jsx";
import { Icon } from "@/components/atoms/Icon.jsx";
import { getFinish } from "@/styles/finishes.js";
import { getESCollection, countESCollected } from "@/utils/esCollection.js";
import { C } from "@/styles/tokens.js";

function ESPlayersGrid({ stickers, goToAlbum }) {
  const esCollection = getESCollection(stickers);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {esCollection.map(({ player, collectedTypes }) => (
        <div
          key={player.id}
          onClick={() => goToAlbum?.({ position: "Extra Stickers", search: player.linkedCode })}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.82"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          style={{
            background: C.surface,
            border: `1px solid ${Object.keys(collectedTypes).length > 0 ? "#6d48a844" : C.border}`,
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 18 }}>{player.flag}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {player.name}
            </div>
            <div style={{ fontSize: 10, color: C.t3 }}>{player.id} · {player.teamName}</div>
          </div>
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {ES_RARITY_TYPES.map((rarity) => {
              const fin = getFinish(rarity);
              const collected = (collectedTypes[rarity] ?? 0) > 0;
              return (
                <div
                  key={rarity}
                  title={fin.label}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: collected ? fin.color : C.borderHi,
                    border: `1px solid ${collected ? fin.border : C.border}`,
                    boxShadow: collected ? `0 0 6px ${fin.glow}` : "none",
                    transition: "all .2s",
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginTop: 4, paddingLeft: 2 }}>
        {ES_RARITY_TYPES.map((rarity) => {
          const fin = getFinish(rarity);
          return (
            <div key={rarity} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: fin.color, border: `1px solid ${fin.border}` }} />
              <span style={{ fontSize: 9, color: C.t3 }}>{fin.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Teams({ stickers, setPage, setTeamFilter, goToAlbum, initialSection }) {
  const [grp, setGrp] = usePersistedFilter("filter_selecoes_grp", "Todos");
  const [search, setSearch] = useState("");
  const [sortTeams, setSortTeams] = usePersistedFilter("filter_selecoes_sort", "pct");
  const [extrasTab, setExtrasTab] = usePersistedFilter("filter_selecoes_extras", "FWC");

  useEffect(() => {
    if (initialSection?._ts && initialSection.section) {
      setGrp(initialSection.section);
      if (initialSection.sub) setExtrasTab(initialSection.sub);
    }
  }, [initialSection?._ts]);

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

  const isCollected = (s) => s.status === "Tenho" || s.status === "Repetida";
  const fwcOwned = stickers.filter((s) => s.team === "FWC" && isCollected(s)).length;
  const fwcTotal = stickers.filter((s) => s.team === "FWC").length;
  const ccOwned = stickers.filter((s) => s.team === "CC" && isCollected(s)).length;
  const esCount = countESCollected(stickers);

  const emblemasTotal = stickers.filter((s) => s.team === "FWC" && s.section === "Emblemas e Mascotes").length;
  const emblemasOwned = stickers.filter((s) => s.team === "FWC" && s.section === "Emblemas e Mascotes" && isCollected(s)).length;
  const historicosTotal = stickers.filter((s) => s.team === "FWC" && s.section === "Momentos Históricos").length;
  const historicosOwned = stickers.filter((s) => s.team === "FWC" && s.section === "Momentos Históricos" && isCollected(s)).length;

  const sectionHeader = (icon, label, count) => (
    <div style={{
      fontSize: 12, fontWeight: 700, color: C.t2,
      textTransform: "uppercase", letterSpacing: "0.08em",
      marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
    }}>
      {icon} {label}
      <span style={{ fontSize: 11, color: C.t3, fontWeight: 400 }}>({count})</span>
    </div>
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
            fontSize: 16,
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
              {g === "Todos" ? "Todos" : g === "Extras" ? "Outras" : `Grupo ${g}`}
            </button>
          ))}
        </div>
      </div>

      {grp === "Extras" ? (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[
              { id: "FWC", label: "🌐 FWC", count: `${fwcOwned}/${fwcTotal}` },
              { id: "CC",  label: "🥤 Coca-Cola", count: `${ccOwned}/14` },
              { id: "ES",  label: "⭐ Extra Stickers", count: `${esCount}/80` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setExtrasTab(tab.id)}
                className="fc-btn"
                style={{
                  flex: 1,
                  background: extrasTab === tab.id ? C.amberDim : C.surface,
                  border: `1px solid ${extrasTab === tab.id ? C.amber + "66" : C.border}`,
                  color: extrasTab === tab.id ? C.amber : C.t2,
                  borderRadius: 10,
                  padding: "8px 6px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                  transition: "all .18s ease",
                  textAlign: "center",
                }}
              >
                <div>{tab.label}</div>
                <div style={{ fontSize: 10, color: extrasTab === tab.id ? C.amber : C.t3, fontWeight: 400, marginTop: 2 }}>{tab.count}</div>
              </button>
            ))}
          </div>

          {extrasTab === "FWC" && (
            <div>
              {sectionHeader("🏆", "Emblemas e Mascotes", `${emblemasOwned} / ${emblemasTotal}`)}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {stickers
                  .filter((s) => s.team === "FWC" && s.section === "Emblemas e Mascotes")
                  .map((s, i) => (
                    <StickerCard
                      key={s.id}
                      s={s}
                      delay={i * 0.03}
                      onClick={() => { setTeamFilter("FWC"); setPage("stickers"); }}
                    />
                  ))}
              </div>
              {sectionHeader("📸", "Momentos Históricos", `${historicosOwned} / ${historicosTotal}`)}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {stickers
                  .filter((s) => s.team === "FWC" && s.section === "Momentos Históricos")
                  .map((s, i) => (
                    <StickerCard
                      key={s.id}
                      s={s}
                      delay={i * 0.03}
                      onClick={() => { setTeamFilter("FWC"); setPage("stickers"); }}
                    />
                  ))}
              </div>
            </div>
          )}

          {extrasTab === "CC" && (
            <div>
              {sectionHeader("🥤", "Coca-Cola", `${ccOwned}/14`)}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {stickers
                  .filter((s) => s.team === "CC")
                  .map((s, i) => (
                    <StickerCard
                      key={s.id}
                      s={s}
                      delay={i * 0.03}
                      onClick={() => { setTeamFilter("CC"); setPage("stickers"); }}
                    />
                  ))}
              </div>
            </div>
          )}

          {extrasTab === "ES" && (
            <div>
              {sectionHeader("⭐", "Extra Stickers", `${esCount}/80`)}
              <ESPlayersGrid stickers={stickers} goToAlbum={goToAlbum} />
            </div>
          )}
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
