import { useState } from "react";
import { Trades } from "@/components/pages/Trades.jsx";
import { Trocador } from "@/components/pages/Trocador.jsx";
import { C } from "@/styles/tokens.js";

const VIEWS = [
  { id: "repetidas", label: "Minhas repetidas" },
  { id: "trocador", label: "Trocador" },
];

export function TrocasHub({ stickers, addToast, goToAlbum, setPage, setTeamFilter }) {
  // Troque o valor inicial para "trocador" se quiser que o Trocador abra primeiro.
  const [view, setView] = useState("repetidas");

  return (
    <div>
      {/* Segmented control */}
      <div
        role="tablist"
        aria-label="Modo de troca"
        style={{
          display: "flex",
          gap: 4,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 4,
          marginBottom: 20,
        }}
      >
        {VIEWS.map((v) => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={active}
              onClick={() => setView(v.id)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: active ? 800 : 600,
                color: active ? "#0c0c1a" : C.t2,
                background: active
                  ? `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`
                  : "transparent",
                transition: "background .2s, color .2s",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>

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
        <Trocador stickers={stickers} addToast={addToast} />
      </div>
    </div>
  );
}
