import { usePersistedFilter } from "@/hooks/usePersistedFilter.js";
import { AddSinglePanel } from "@/components/organisms/AddSinglePanel.jsx";
import { AddTeamPanel } from "@/components/organisms/AddTeamPanel.jsx";
import { AddBatchPanel } from "@/components/organisms/AddBatchPanel.jsx";
import { C } from "@/styles/tokens.js";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs.jsx";

const MODES = [
  { id: "single", label: "Individual" },
  { id: "team", label: "Por Seleção" },
  { id: "batch", label: "Lote Livre" },
];

export function AddPage({ stickers, setStickers, addToast }) {
  const [mode, setMode] = usePersistedFilter("filter_add_mode", "single");

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 3 }}>
        Adicionar Figurinhas
      </div>
      <div style={{ fontSize: 12, color: C.t3, marginBottom: 18 }}>
        Individual · Por Seleção · Lote Livre
      </div>
      <SegmentedTabs items={MODES} value={mode} onChange={setMode} />

      {mode === "single" && <AddSinglePanel stickers={stickers} setStickers={setStickers} addToast={addToast} />}
      {mode === "team"   && <AddTeamPanel   stickers={stickers} setStickers={setStickers} />}
      {mode === "batch"  && <AddBatchPanel  stickers={stickers} setStickers={setStickers} addToast={addToast} />}
    </div>
  );
}
