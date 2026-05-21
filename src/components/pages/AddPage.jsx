import { useState } from "react";
import { Icon } from "@/components/atoms/Icon.jsx";
import { AddSinglePanel } from "@/components/organisms/AddSinglePanel.jsx";
import { AddTeamPanel } from "@/components/organisms/AddTeamPanel.jsx";
import { AddBatchPanel } from "@/components/organisms/AddBatchPanel.jsx";
import { C } from "@/styles/tokens.js";

const MODES = [
  { id: "single", label: "Individual" },
  { id: "team", label: "Por Seleção" },
  { id: "batch", label: "Lote Livre" },
  { id: "scan", label: "Scanner" },
];

export function AddPage({ stickers, setStickers, addToast }) {
  const [mode, setMode] = useState("single");

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 3 }}>
        Adicionar Figurinhas
      </div>
      <div style={{ fontSize: 12, color: C.t3, marginBottom: 18 }}>
        Individual · Por Seleção · Lote · Scanner
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
      {mode === "batch"  && <AddBatchPanel  stickers={stickers} setStickers={setStickers} />}
      {mode === "scan"   && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: `linear-gradient(135deg,${C.amber}22,${C.violet}22)`,
            border: `1px solid ${C.amber}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: C.amber }}>
            <Icon name="camera" size={42} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Scanner de Figurinhas</div>
          <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.6, marginBottom: 20, maxWidth: 280, margin: "0 auto 20px" }}>
            Reconhecimento automático via câmera usando OCR + IA.
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px", textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Roadmap</div>
            {[["Captura por câmera em tempo real",true],["OCR do código (Tesseract.js)",true],["Detecção de tipo por cor/brilho",false],["Leitura de múltiplas figurinhas",false],["IA de identificação visual",false]].map(([item,near],i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i<4?9:0 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: near?C.amber:C.t4, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: near?C.t1:C.t3, flex: 1 }}>{item}</span>
                <span style={{ fontSize: 9, color: near?C.amber:C.t3, fontWeight: 700, background: near?C.amberDim:C.surface, borderRadius: 6, padding: "2px 7px" }}>{near?"Em breve":"Planejado"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
