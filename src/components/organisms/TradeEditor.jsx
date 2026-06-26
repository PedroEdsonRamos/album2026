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

function PoolSide({ title, accent, pool, selected, onToggle, query, onQuery, emptyMsg, prioritize }) {
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
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar por nome, time ou código…"
            style={{ width: "100%", boxSizing: "border-box", background: "#0c0c1a", border: `1px solid ${C.border}`, color: "#fff", fontSize: 16, padding: "8px 10px", borderRadius: 8, marginBottom: 8, fontFamily: "inherit" }}
          />
          <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((s) => {
              const on = selected.has(s.code);
              return (
                <button key={s.code} type="button" onClick={() => onToggle(s.code)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left", border: `1px solid ${on ? accent : C.border}`, background: on ? `${accent}22` : "transparent", color: "#fff", fontFamily: "inherit" }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || s.code}</span>
                    <span style={{ display: "block", fontSize: 11, color: C.t3 }}>{(s.teamName || s.team || "")}{s.code ? ` · ${s.code}` : ""}</span>
                  </span>
                  <span style={{ fontSize: 16, color: on ? accent : C.t3, flexShrink: 0 }}>{on ? "✓" : "+"}</span>
                </button>
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

  const toggle = (setFn) => (code) =>
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });

  const total = entrego.size + recebo.size;

  if (reviewing) {
    const ge = [...entrego];
    const gr = [...recebo];
    return (
      <div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: C.t2, marginBottom: 10 }}>Resumo da troca</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.amber, marginBottom: 4 }}>Você entrega ({ge.length})</div>
          {ge.length ? ge.map((c) => (<div key={c} style={{ fontSize: 13, color: "#fff", padding: "1px 0" }}>{labelOf(c)}</div>)) : <div style={{ fontSize: 13, color: C.t3 }}>—</div>}
          <div style={{ fontSize: 12, fontWeight: 800, color: C.green, margin: "10px 0 4px" }}>Você recebe ({gr.length})</div>
          {gr.length ? gr.map((c) => (<div key={c} style={{ fontSize: 13, color: "#fff", padding: "1px 0" }}>{labelOf(c)}</div>)) : <div style={{ fontSize: 13, color: C.t3 }}>—</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setReviewing(false)}
            style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.t2, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Cancelar
          </button>
          <button type="button" onClick={() => onConfirm && onConfirm({ entrego: ge, recebo: gr })}
            style={{ flex: 2, padding: "12px 14px", borderRadius: 12, border: "none", background: C.amber, color: "#0c0c1a", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PoolSide title="Você entrega" accent={C.amber} pool={poolEntregar} selected={entrego} onToggle={toggle(setEntrego)} query={qE} onQuery={setQE} prioritize={prioE} emptyMsg="Você não tem repetidas que o outro precise." />
      <PoolSide title="Você recebe" accent={C.green} pool={poolReceber} selected={recebo} onToggle={toggle(setRecebo)} query={qR} onQuery={setQR} prioritize={prioR} emptyMsg="O outro não tem repetidas que te faltem." />
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
