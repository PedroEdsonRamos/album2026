import { useMemo, useState, useEffect } from "react";
import { C } from "@/styles/tokens.js";
import { getFinish } from "@/styles/finishes.js";
import { getCardLines } from "@/components/molecules/StickerCard.jsx";

// espelha RARITY_PRIORITY (StickerCard.jsx): mais raro -> mais comum
const RARITY_ORDER = ["Ouro", "Prata", "Bronze", "Lilás", "Metalizado", "McDonalds", "Comum", "Coca-Cola"];
const rank = (r) => { const i = RARITY_ORDER.indexOf(r); return i === -1 ? 999 : i; };
const rarColor = (r) => { const f = getFinish(r); return (f && f.color) || C.t2; };
const rarBorder = (r) => { const f = getFinish(r); return (f && f.border) || C.border; };

// raridades trocáveis (excedentes), ordenadas do mais raro pro mais comum
function availRarities(s) {
  const keys = Object.keys(s && s.typeBreakdown ? s.typeBreakdown : {});
  if (keys.length) return keys.slice().sort((a, b) => rank(a) - rank(b));
  return s && s.rarity ? [s.rarity] : [];
}
// padrão ao dar: a mais comum disponível (guarda as raras)
function defaultGive(s) { const a = availRarities(s); return a.length ? a[a.length - 1] : undefined; }
// tipo a exibir (lado recebe / item sem escolha): mais rara do breakdown, senão a base
function showRarity(s) { const a = availRarities(s); return a.length ? a[0] : (s ? s.rarity : undefined); }

function cardLines(s) {
  let l = {};
  try { l = getCardLines(s) || {}; } catch (e) { l = {}; }
  const desc = (l.desc || s.name || s.code || "").replace(/\n/g, " ");
  const footer = (l.footer || s.position || "").replace(/\n/g, " ");
  return { desc, footer };
}

function filterPool(pool, q) {
  const t = q.trim().toLowerCase();
  if (!t) return pool;
  return pool.filter((s) => {
    const { desc, footer } = cardLines(s);
    return (
      desc.toLowerCase().includes(t) ||
      footer.toLowerCase().includes(t) ||
      (s.code || "").toLowerCase().includes(t)
    );
  });
}

function RarityTag({ r }) {
  if (!r) return null;
  return <span style={{ color: rarColor(r), fontWeight: 800 }}>{r}</span>;
}

function Item({ s, on, accent, onToggle, withPicker, chosen, onRarity }) {
  const { desc, footer } = cardLines(s);
  const rars = withPicker ? availRarities(s) : [];
  const single = !withPicker ? showRarity(s) : (rars.length <= 1 ? rars[0] : null);
  return (
    <div style={{ border: `1px solid ${on ? accent : C.border}`, background: on ? `${accent}14` : "transparent", borderRadius: 8 }}>
      <button type="button" onClick={() => onToggle(s.code)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 10px", cursor: "pointer", textAlign: "left", border: "none", background: "transparent", color: "#fff", fontFamily: "inherit", width: "100%" }}>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{desc}</span>
          <span style={{ display: "block", fontSize: 11, color: C.t3 }}>
            {s.code}{footer ? ` · ${footer}` : ""}{single ? " · " : ""}{single ? <RarityTag r={single} /> : null}
          </span>
        </span>
        <span style={{ fontSize: 16, color: on ? accent : C.t3, flexShrink: 0 }}>{on ? "✓" : "+"}</span>
      </button>
      {on && withPicker && rars.length > 1 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 10px 8px" }}>
          {rars.map((r) => {
            const sel = (chosen || defaultGive(s)) === r;
            const qty = s.typeBreakdown ? s.typeBreakdown[r] : undefined;
            const col = rarColor(r);
            return (
              <button key={r} type="button" onClick={() => onRarity(s.code, r)}
                style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                  border: `1px solid ${sel ? col : rarBorder(r)}`, background: sel ? col : "transparent", color: sel ? "#0c0c1a" : col }}>
                {r}{qty ? ` (${qty})` : ""}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PoolSide({ title, accent, pool, selected, onToggle, query, onQuery, emptyMsg, prioritize, withPicker, rarityByCode, onRarity }) {
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
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Buscar por nome, categoria ou código…"
            style={{ width: "100%", boxSizing: "border-box", background: "#0c0c1a", border: `1px solid ${C.border}`, color: "#fff", fontSize: 16, padding: "8px 10px", borderRadius: 8, marginBottom: 8, fontFamily: "inherit" }} />
          <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((s) => (
              <Item key={s.code} s={s} on={selected.has(s.code)} accent={accent} onToggle={onToggle}
                withPicker={withPicker} chosen={rarityByCode ? rarityByCode[s.code] : undefined} onRarity={onRarity} />
            ))}
            {filtered.length === 0 ? (<div style={{ fontSize: 12, color: C.t3, padding: "6px 0" }}>Nada encontrado.</div>) : null}
          </div>
        </>
      )}
    </div>
  );
}

// linha do resumo: CÓDIGO · nome · categoria · raridade(colorida)
function SummaryLine({ s, rarity }) {
  const { desc, footer } = cardLines(s);
  return (
    <div style={{ fontSize: 13, color: "#fff", padding: "2px 0" }}>
      <b>{s.code}</b>
      {desc ? ` · ${desc}` : ""}
      {footer ? ` · ${footer}` : ""}
      {rarity ? <> · <RarityTag r={rarity} /></> : null}
    </div>
  );
}

export function TradeEditor({ poolEntregar = [], poolReceber = [], initialEntrego = [], initialRecebo = [], onConfirm, confirmLabel = "Confirmar troca", isDemo, onBlockedAction }) {
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

  // garante raridade-padrão para todos os itens em entrego (inclui pré-selecionados)
  useEffect(() => {
    setRarityByCode((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const code of entrego) {
        if (!next[code]) {
          const d = defaultGive(byCode[code]);
          if (d) { next[code] = d; changed = true; }
        }
      }
      for (const code of Object.keys(next)) {
        if (!entrego.has(code)) { delete next[code]; changed = true; }
      }
      return changed ? next : prev;
    });
  }, [entrego, byCode]);

  const toggleReceive = (code) => setRecebo((p) => { const n = new Set(p); n.has(code) ? n.delete(code) : n.add(code); return n; });
  const toggleGive = (code) => setEntrego((p) => { const n = new Set(p); n.has(code) ? n.delete(code) : n.add(code); return n; });
  const setRarity = (code, rarity) => setRarityByCode((r) => ({ ...r, [code]: rarity }));

  const total = entrego.size + recebo.size;

  const buildGive = () =>
    [...entrego].map((code) => {
      const r = rarityByCode[code] || defaultGive(byCode[code]);
      return r ? { code, rarity: r } : code;
    });

  if (reviewing) {
    const give = buildGive();
    const rec = [...recebo];
    return (
      <div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: C.t2, marginBottom: 10 }}>Resumo da troca</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.amber, marginBottom: 4 }}>Você entrega ({give.length})</div>
          {give.length ? give.map((g) => {
            const code = typeof g === "string" ? g : g.code;
            const r = typeof g === "string" ? null : g.rarity;
            return <SummaryLine key={code} s={byCode[code] || { code }} rarity={r} />;
          }) : <div style={{ fontSize: 13, color: C.t3 }}>—</div>}
          <div style={{ fontSize: 12, fontWeight: 800, color: C.green, margin: "10px 0 4px" }}>Você recebe ({rec.length})</div>
          {rec.length ? rec.map((code) => (
            <SummaryLine key={code} s={byCode[code] || { code }} rarity={showRarity(byCode[code])} />
          )) : <div style={{ fontSize: 13, color: C.t3 }}>—</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setReviewing(false)} style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.t2, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Voltar</button>
          <button type="button" onClick={isDemo ? onBlockedAction : () => onConfirm && onConfirm({ entrego: give, recebo: rec })} style={{ flex: 2, padding: "12px 14px", borderRadius: 12, border: "none", background: isDemo ? C.border : C.amber, color: isDemo ? C.t3 : "#0c0c1a", fontWeight: 800, fontSize: 15, cursor: isDemo ? "default" : "pointer", fontFamily: "inherit", opacity: isDemo ? 0.4 : 1 }}>{confirmLabel}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PoolSide title="Você entrega" accent={C.amber} pool={poolEntregar} selected={entrego} onToggle={toggleGive} query={qE} onQuery={setQE} prioritize={prioE} emptyMsg="Você não tem repetidas que o outro precise." withPicker rarityByCode={rarityByCode} onRarity={setRarity} />
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
