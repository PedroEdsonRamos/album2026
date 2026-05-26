import { useState } from "react";
import { ALL_TEAMS } from "@/data/teams.js";
import { Icon } from "@/components/atoms/Icon.jsx";
import { C } from "@/styles/tokens.js";

function expandNums(str) {
  const out = [];
  str.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean).forEach((p) => {
    const r = p.match(/^(\d+)\s*-\s*(\d+)$/);
    if (r) { const a = +r[1], b = +r[2]; for (let i = Math.min(a,b); i <= Math.max(a,b); i++) out.push(i); }
    else if (/^\d+$/.test(p)) out.push(+p);
  });
  return [...new Set(out)];
}

function ResultBox({ result }) {
  if (!result) return null;
  return (
    <div style={{ background: C.greenDim, border: `1px solid ${C.green}40`, borderRadius: 14, padding: "16px", marginTop: 14, animation: "fadeIn .4s" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 10 }}>✓ Processado!</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
        <div><div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>{result.added}</div><div style={{ fontSize: 10, color: C.t3 }}>Adicionadas</div></div>
        <div><div style={{ fontSize: 22, fontWeight: 900, color: C.violet }}>{result.dups}</div><div style={{ fontSize: 10, color: C.t3 }}>Repetidas</div></div>
        <div><div style={{ fontSize: 22, fontWeight: 900, color: C.red }}>{result.notFound}</div><div style={{ fontSize: 10, color: C.t3 }}>Inválidas</div></div>
      </div>
    </div>
  );
}

export function AddTeamPanel({ stickers, setStickers }) {
  const [teamSel, setTeamSel] = useState("BRA");
  const [teamNums, setTeamNums] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [result, setResult] = useState(null);
  const [adding, setAdding] = useState(false);

  const visibleTeams = ALL_TEAMS.filter(
    (t) => !teamSearch.trim() || t.name.toLowerCase().includes(teamSearch.toLowerCase()) || t.id.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const handleTeamBatch = () => {
    const nums = expandNums(teamNums);
    if (!nums.length) return;
    setAdding(true);
    setTimeout(() => {
      let added = 0, dups = 0, notFound = 0;
      const upd = { ...Object.fromEntries(stickers.map((s) => [s.id, s])) };
      nums.forEach((n) => {
        const m = stickers.find((s) => s.code === `${teamSel}${n}`.toUpperCase());
        if (!m) { notFound++; return; }
        if (m.status === "Tenho") { dups++; upd[m.id] = { ...upd[m.id], status: "Repetida", duplicates: (upd[m.id].duplicates||0)+1 }; }
        else { added++; upd[m.id] = { ...upd[m.id], status: "Tenho", addedAt: new Date().toISOString() }; }
      });
      setStickers((prev) => prev.map((s) => upd[s.id] || s));
      setResult({ added, dups, notFound });
      setTeamNums(""); setAdding(false);
    }, 500);
  };

  const previewNums = expandNums(teamNums);
  const selectedName = ALL_TEAMS.find((t) => t.id === teamSel)?.name;

  return (
    <div>
      <div style={{ background: C.amberDim, border: `1px solid ${C.amber}44`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.amber, marginBottom: 8 }}>📋 Como lançar por seleção</div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: C.t2, lineHeight: 1.7 }}>
          <li>Selecione a seleção no filtro abaixo</li>
          <li>Digite os números separados por vírgula ou em intervalos (ex: 7-12)</li>
          <li>Figurinhas de jogadores comuns são lançadas como <strong style={{ color: C.t1 }}>Comum</strong> automaticamente</li>
        </ol>
        <div style={{ marginTop: 8, fontSize: 11, color: C.amber }}>
          ⭐ Para Extra Stickers, use o modo <strong>Individual</strong> e escolha o tipo (Lilás, Bronze, Prata ou Ouro).
        </div>
      </div>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        Seleção
      </label>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.t3, pointerEvents: "none" }}>
          <Icon name="search" size={15} />
        </div>
        <input value={teamSearch} onChange={(e) => setTeamSearch(e.target.value)} placeholder="Buscar seleção (ex: Brasil, USA, Áustria)..."
          style={{ width: "100%", background: C.surfaceHi, border: `1px solid ${C.borderHi}`, borderRadius: 10,
            padding: "10px 36px 10px 36px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        {teamSearch && (
          <button onClick={() => setTeamSearch("")}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.t3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 14 }}>
        {visibleTeams.map((t) => (
          <button key={t.id} onClick={() => setTeamSel(t.id)} className="fc-btn"
            style={{ background: teamSel===t.id?`${t.color}33`:C.surface, border: `1px solid ${teamSel===t.id?t.color:C.border}`,
              borderRadius: 10, padding: "8px 10px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
              display: "flex", alignItems: "center", gap: 6, transition: "all .18s ease" }}>
            <span style={{ fontSize: 18 }}>{t.flag}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: teamSel===t.id?"#fff":C.t2 }}>{t.name}</span>
          </button>
        ))}
        {visibleTeams.length === 0 && <div style={{ padding: "10px 14px", fontSize: 12, color: C.t3 }}>Nenhuma seleção encontrada</div>}
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.t2 }}>
          Adicionando para <span style={{ color: "#fff", fontWeight: 700 }}>{selectedName}</span>. Digite só os números.
        </div>
      </div>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        Números das figurinhas
      </label>
      <textarea value={teamNums} onChange={(e) => setTeamNums(e.target.value)} rows={4} placeholder={"Ex: 1, 2, 3, 5\nou intervalos: 7-12"}
        style={{ width: "100%", background: C.surfaceHi, border: `1px solid ${C.borderHi}`, borderRadius: 12,
          padding: "14px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "monospace", resize: "vertical", lineHeight: 1.6 }} />
      <div style={{ fontSize: 11, color: C.t3, margin: "6px 0 14px" }}>
        {previewNums.length} figurinha(s): {previewNums.slice(0, 8).map((n) => `${teamSel}${n}`).join(", ")}{previewNums.length > 8 ? "..." : ""}
      </div>
      <button onClick={handleTeamBatch} disabled={!teamNums.trim() || adding}
        style={{ width: "100%", background: teamNums.trim()?`linear-gradient(135deg,${C.amber},${C.amberLt})`:C.surface,
          border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 800,
          color: teamNums.trim()?"#000":C.t4, cursor: teamNums.trim()?"pointer":"default",
          fontFamily: "inherit", boxShadow: teamNums.trim()?`0 8px 24px ${C.amberGlow}`:"none" }}>
        {adding ? "Processando..." : `Adicionar à ${selectedName}`}
      </button>
      <ResultBox result={result} />
    </div>
  );
}
