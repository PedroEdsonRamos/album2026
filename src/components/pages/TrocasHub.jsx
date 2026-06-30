import { useState } from "react";
import { Trades } from "@/components/pages/Trades.jsx";
import { Trocador } from "@/components/pages/Trocador.jsx";
import { TrocaPorLink } from "@/components/pages/TrocaPorLink.jsx";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs.jsx";

const VIEWS = [
  { id: "link", label: "Oficial", featured: true },
  { id: "trocador", label: "Manual" },
  { id: "repetidas", label: "Repetidas" },
];

export function TrocasHub({ stickers, addToast, applyTrade, goToAlbum, setPage, setTeamFilter, initialView, incomingTrade, isDemo, onBlockedAction }) {
  const [view, setView] = useState(initialView || "link");

  return (
    <div>
      <SegmentedTabs items={VIEWS} value={view} onChange={setView} />

      {/* Ambas montadas (toggle por display) para preservar o estado do Trocador */}
      <div style={{ display: view === "repetidas" ? "block" : "none" }}>
        <Trades
          stickers={stickers}
          addToast={addToast}
          goToAlbum={goToAlbum}
          setPage={setPage}
          setTeamFilter={setTeamFilter}
        />
      </div>
      <div style={{ display: view === "trocador" ? "block" : "none" }}>
        <Trocador stickers={stickers} addToast={addToast} applyTrade={applyTrade} isDemo={isDemo} onBlockedAction={onBlockedAction} />
      </div>
      <div style={{ display: view === "link" ? "block" : "none" }}>
        <TrocaPorLink stickers={stickers} applyTrade={applyTrade} addToast={addToast} incomingLink={incomingTrade} isDemo={isDemo} onBlockedAction={onBlockedAction} />
      </div>
    </div>
  );
}
