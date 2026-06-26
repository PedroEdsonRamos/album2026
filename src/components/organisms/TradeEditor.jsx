import { useMemo, useState } from "react";
import { C } from "@/styles/tokens.js";

function filterPool(pool, q) {
  const t = q.trim().toLowerCase();
  if (!t) return pool;
  return pool.filter((s) => {
    const name = (s.name || "").toLowerCase();
    const team = (s.teamName || s.team || "").toLowerCase();
    const code = (s.code || "").toLowerCase();
    return name.includes(t) || team.includes(t) || code.includes(t);
  });
}

// raridades trocáveis (excedentes por tipo); se não houver breakdown, usa a raridade única
function availRarities(s) {
  const keys = Object.keys(s && s.typeBreakdown ? s.typeBreakdown : {});
  if (keys.length) return keys;
  return s && s.rarity ? [s.rarity] : [];
}

function PoolSide({ title, accent, pool, selected, onToggle, query, onQuery, emptyMsg, prioritize, withRarity, rarityByCode, onRarity }) {
  const filtered = useMemo(() => {
    const list = filterPool(pool, query);
    if (!prioritize || prioritize.size === 0) return list;
    const top = [], rest = [];
    for (const s of list) (prioritize.has(s.code) ? top : rest).push(s);
    return [...top, ...rest];
  }, [pool, query, prioritize]);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 800, color: C.t2 }}>{title}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: accent }}>{selected.size}</span>
      </div>
      {pool.length === 0 ? (
        <div style={{ fontSize: 13, color: C.t3, padding: "8px 0" }}>{emptyMsg}</div>
      ) : (
        <>
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Buscar por nome, time ou código…"
            style={{ width: "100%", boxSizing: "border-box", background: "#0c0c1a", border: `1px solid ${C.border}`, color: "#fff", fontSize: 16, padding: "8px 10px", borderRadius: 8, marginBottom: 8, fontFamily: "inherit" }} />
          <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((s) => {
              const on = selected.has(s.code);
              const rars = withRarity ? availRarities(s) : [];
              const chosen = rarityByCode ? rarityByCode[s.code] : undefined;
              return (
                <div key={s.code} style={{ border: `1px solid ${on ? accent : C.border}`, background: on ? `${accent}14` : "transparent", borderRadius: 8 }}>
                  <button type="button" onClick={() => onToggle(s.code)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 10px", cursor: "pointer", textAlign: "left", border: "none", background: "transparent", color: "#fff", fontFamily: "inherit", width: "100%" }}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || s.code}</span>
                      <span style={{ display: "block", fontSize: 11, color: C.t3 }}>{(s.teamName || s.team || "")}{s.code ? ` · ${s.code}` : ""}</span>
                    </span>
                    <span style={{ fontSize: 16, color: on ? accent : C.t3, flexShrink: 0 }}>{on ? "✓" : "+"}</span>
                  </button>
                  {on && withRarity && rars.length > 1 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 10px 8px" }}>
                      {rars.map((r) => {
                        const sel = (chosen || rars[0]) === r;
                        const qty = s.typeBreakdown ? s.typeBreakdown[r] : undefined;
                        return (
                          <button key={r} type="button" onClick={() => onRarity(s.code, r)}
                            style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${sel ? accent : C.border}`, background: sel ? accent : "transparent", color: sel ? "#0c0c1a" : C.t2 }}>
                            {r}{qty ? ` (${qty})` : ""}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {filtered.length === 0 ? (<div style={{ fontSize: 12, color: C.t3, padding: "6px 0" }}>Nada encontrado.</div>) : null}
          </div>
        </>
      )}
    </div>
  );
}

export function TradeEditor({ poolEntregar = [], poolReceber = [], initialEntrego = [], initialRecebo = [], onConfirm, confirmLabel = "Confirmar troca" }) {
  const [entrego, setEntrego] = useState(() => new Set(initialEntrego));
  const [recebo, setRecebo] = useState(() => new Set(initialRecebo));
  const [rarityByCode, setRarityByCode] = useState({});
  const [qE, setQE] = useState("");
  const [qR, setQR] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const prioE = useMemo(() => new Set(initialEntrego), [initialEntrego]);
  const prioR = useMemo(() => new Set(initialRecebo), [initialRecebo]);

  const byCode = useMemo(() => {
    const m = {};
    for (const s of poolEntregar) if (s && s.code) m[s.code] = s;
    for (const s of poolReceber) if (s && s.code) m[s.code] = s;
    return m;
  }, [poolEntregar, poolReceber]);

  const labelOf = (code) => { const s = byCode[code]; return s ? (s.name || s.code) : code; };

  const toggleReceive = (code) =>
    setRecebo((prev) => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n; });

  const toggleGive = (code) => {
    const willSelect = !entrego.has(code);
    setEntrego((prev) => { const n = new Set(prev); willSelect ? n.add(code) : n.delete(code); return n; });
    setRarityByCode((r) => {
      const c = { ...r };
      if (willSelect) { const def = availRarities(byCode[code])[0]; if (def) c[code] = def; }
      else delete c[code];
      return c;
    });
  };

  const setRarity = (code, rarity) => setRarityByCode((r) => ({ ...r, [code]: rarity }));

  const total = entrego.size + recebo.size;

  const buildGive = () =>
    [...entrego].map((code) => {
      const s = byCode[code];
      const r = rarityByCode[code] || availRarities(s)[0];
      return r ? { code, rarity: r } : code;
    });

  if (reviewing) {
    const give = buildGive();
    const gr = [...recebo];
    return (
      <div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: C.t2, marginBottom: 10 }}>Resumo da troca</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.amber, marginBottom: 4 }}>Você entrega ({give.length})</div>
          {give.length ? give.map((g) => {
            const code = typeof g === "string" ? g : g.code;
            const r = typeof g === "string" ? null : g.rarity;
            return (<div key={code} style={{ fontSize: 13, color: "#fff", padding: "1px 0" }}>{labelOf(code)}{r ? ` · ${r}` : ""}</div>);
          }) : <div style={{ fontSize: 13, color: C.t3 }}>—</div>}
          <div style={{ fontSize: 12, fontWeight: 800, color: C.green, margin: "10px 0 4px" }}>Você recebe ({gr.length})</div>
          {gr.length ? gr.map((c) => (<div key={c} style={{ fontSize: 13, color: "#fff", padding: "1px 0" }}>{labelOf(c)}</div>)) : <div style={{ fontSize: 13, color: C.t3 }}>—</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setReviewing(false)} style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.t2, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button type="button" onClick={() => onConfirm && onConfirm({ entrego: give, recebo: gr })} style={{ flex: 2, padding: "12px 14px", borderRadius: 12, border: "none", background: C.amber, color: "#0c0c1a", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>{confirmLabel}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PoolSide title="Você entrega" accent={C.amber} pool={poolEntregar} selected={entrego} onToggle={toggleGive} query={qE} onQuery={setQE} prioritize={prioE} emptyMsg="Você não tem repetidas que o outro precise." withRarity rarityByCode={rarityByCode} onRarity={setRarity} />
      <PoolSide title="Você recebe" accent={C.green} pool={poolReceber} selected={recebo} onToggle={toggleReceive} query={qR} onQuery={setQR} prioritize={prioR} emptyMsg="O outro não tem repetidas que te faltem." />
      <div style={{ fontSize: 13, color: C.t3, margin: "2px 2px 10px" }}>
        Entrega <b style={{ color: C.amber }}>{entrego.size}</b> · Recebe <b style={{ color: C.green }}>{recebo.size}</b>
      </div>
      <button type="button" onClick={() => total > 0 && setReviewing(true)} disabled={total === 0}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "none", background: total === 0 ? C.border : C.amber, color: total === 0 ? C.t3 : "#0c0c1a", fontWeight: 800, fontSize: 15, cursor: total === 0 ? "default" : "pointer", fontFamily: "inherit" }}>
        Revisar troca
      </button>
    </div>
  );
}

export default TradeEditor;
