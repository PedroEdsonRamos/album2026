import { useState } from "react";
import { AddSinglePanel } from "@/components/organisms/AddSinglePanel.jsx";
import { AddTeamPanel } from "@/components/organisms/AddTeamPanel.jsx";
import { AddBatchPanel } from "@/components/organisms/AddBatchPanel.jsx";
import { C } from "@/styles/tokens.js";

const MODES = [
  { id: "single", label: "Individual" },
  { id: "team", label: "Por Seleção" },
  { id: "batch", label: "Lote Livre" },
];

export function AddPage({ stickers, setStickers, addToast }) {
  const [mode, setMode] = useState("single");

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 3 }}>
        Adicionar Figurinhas
      </div>
      <div style={{ fontSize: 12, color: C.t3, marginBottom: 18 }}>
        Individual · Por Seleção · Lote Livre
      </div>
      <div style={{ display: "flex", background: C.surface, borderRadius: 12, padding: 4, marginBottom: 20, gap: 3 }}>
        {MODES.map(({ id, label }) => (
          <button key={id} onClick={() => setMode(id)} className="fc-btn"
            style={{ flex: 1, background: mode===id?C.amberDim:"transparent",
              border: `1px solid ${mode===id?C.amber+"66":"transparent"}`,
              color: mode===id?C.amber:C.t2, borderRadius: 9, padding: "9px 4px",
              fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
            {label}
          </button>
        ))}
      </div>

      {mode === "single" && <AddSinglePanel stickers={stickers} setStickers={setStickers} addToast={addToast} />}
      {mode === "team"   && <AddTeamPanel   stickers={stickers} setStickers={setStickers} />}
      {mode === "batch"  && <AddBatchPanel  stickers={stickers} setStickers={setStickers} addToast={addToast} />}
    </div>
  );
}
