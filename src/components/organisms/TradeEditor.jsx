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

function PoolSide({ title, accent, pool, selected, onToggle, query, onQuery, emptyMsg }) {
  const filtered = useMemo(() => filterPool(pool, query), [pool, query]);
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
            style={{
              width: "100%", boxSizing: "border-box", background: "#0c0c1a",
              border: `1px solid ${C.border}`, color: "#fff", fontSize: 16,
              padding: "8px 10px", borderRadius: 8, marginBottom: 8, fontFamily: "inherit",
            }}
          />
          <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((s) => {
              const on = selected.has(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => onToggle(s.code)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                    border: `1px solid ${on ? accent : C.border}`,
                    background: on ? `${accent}22` : "transparent",
                    color: "#fff", fontFamily: "inherit",
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name || s.code}
                    </span>
                    <span style={{ display: "block", fontSize: 11, color: C.t3 }}>
                      {(s.teamName || s.team || "")}{s.code ? ` · ${s.code}` : ""}
                    </span>
                  </span>
                  <span style={{ fontSize: 16, color: on ? accent : C.t3, flexShrink: 0 }}>{on ? "✓" : "+"}</span>
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <div style={{ fontSize: 12, color: C.t3, padding: "6px 0" }}>Nada encontrado.</div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

export function TradeEditor({
  poolEntregar = [],
  poolReceber = [],
  initialEntrego = [],
  initialRecebo = [],
  onConfirm,
  confirmLabel = "Confirmar troca",
}) {
  const [entrego, setEntrego] = useState(() => new Set(initialEntrego));
  const [recebo, setRecebo] = useState(() => new Set(initialRecebo));
  const [qE, setQE] = useState("");
  const [qR, setQR] = useState("");

  const toggle = (setFn) => (code) =>
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const total = entrego.size + recebo.size;

  function handleConfirm() {
    if (!onConfirm || total === 0) return;
    onConfirm({ entrego: [...entrego], recebo: [...recebo] });
  }

  return (
    <div>
      <PoolSide
        title="Você entrega"
        accent={C.amber}
        pool={poolEntregar}
        selected={entrego}
        onToggle={toggle(setEntrego)}
        query={qE}
        onQuery={setQE}
        emptyMsg="Você não tem repetidas que o outro precise."
      />
      <PoolSide
        title="Você recebe"
        accent={C.green}
        pool={poolReceber}
        selected={recebo}
        onToggle={toggle(setRecebo)}
        query={qR}
        onQuery={setQR}
        emptyMsg="O outro não tem repetidas que te faltem."
      />

      <div style={{ fontSize: 13, color: C.t3, margin: "2px 2px 10px" }}>
        Entrega <b style={{ color: C.amber }}>{entrego.size}</b> · Recebe <b style={{ color: C.green }}>{recebo.size}</b>
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={total === 0}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 12, border: "none",
          background: total === 0 ? C.border : C.amber,
          color: total === 0 ? C.t3 : "#0c0c1a",
          fontWeight: 800, fontSize: 15, cursor: total === 0 ? "default" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

export default TradeEditor;
