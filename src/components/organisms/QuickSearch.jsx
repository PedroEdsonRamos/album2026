import { useState, useEffect, useRef, useMemo } from "react";
import { teamInfo } from "@/utils/teamInfo.js";
import { getFinish } from "@/styles/finishes.js";
import { Icon } from "@/components/atoms/Icon.jsx";
import { C } from "@/styles/tokens.js";

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function QuickSearch({ stickers, onClose, onGoTo }) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    if (!debouncedQ.trim()) return [];
    const queryNorm = debouncedQ.trim().toUpperCase().replace(/\s/g, "");
    const queryUp = debouncedQ.trim().toUpperCase();
    return stickers
      .filter((s) => {
        const codeMatch = s.code.replace(/\s/g, "").includes(queryNorm);
        const nameMatch = s.name.toUpperCase().includes(queryUp);
        const teamMatch =
          (s.teamName || "").toUpperCase().includes(queryUp) ||
          s.team.toUpperCase().includes(queryNorm);
        return codeMatch || nameMatch || teamMatch;
      })
      .slice(0, 50);
  }, [debouncedQ, stickers]);

  const exact = debouncedQ.trim()
    ? (() => {
        const queryNorm = debouncedQ.trim().toUpperCase().replace(/\s+/g, "");
        return results.find((r) => r.code === queryNorm);
      })()
    : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(6,6,14,0.87)",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480, width: "100%", margin: "0 auto", padding: "16px" }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <div
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: C.t3,
              }}
            >
              <Icon name="search" size={16} />
            </div>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value.toUpperCase())}
              placeholder="Buscar por código (BRA10), seleção (Brasil) ou jogador (Messi)..."
              style={{
                width: "100%",
                background: C.panelHi,
                border: `1px solid ${C.amber}44`,
                borderRadius: 12,
                padding: "14px 14px 14px 38px",
                color: "#fff",
                fontSize: 16,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
          <button
            onClick={onClose}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              width: 48,
              height: 48,
              color: C.t2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {exact && (() => {
          const owned = exact.status === "Tenho";
          const dup = exact.status === "Repetida";
          const team = teamInfo(exact.team);
          const fin = getFinish(exact.rarity);
          return (
            <div
              style={{
                background: owned ? C.greenDim : dup ? fin.bg : C.redDim,
                border: `1px solid ${owned ? C.green : dup ? fin.border : C.red}55`,
                borderRadius: 14,
                padding: "16px",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 36 }}>{team.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: C.t3 }}>
                  {exact.code}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{exact.name}</div>
                <div style={{ fontSize: 11, color: C.t2 }}>
                  {exact.teamName} · {exact.position}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: owned ? C.green : dup ? fin.color : C.red,
                  }}
                >
                  {owned ? "VOCÊ TEM" : dup ? "REPETIDA" : "FALTA"}
                </div>
                <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>
                  {owned ? "✓ no álbum" : dup ? `×${exact.duplicates}` : "não coletada"}
                </div>
              </div>
            </div>
          );
        })()}

        <div
          style={{
            maxHeight: "62vh",
            overflowY: "auto",
            overflowX: "hidden",
            borderRadius: 12,
            border: debouncedQ.trim() ? `1px solid ${C.border}` : "none",
            background: debouncedQ.trim() ? C.panelHi : "transparent",
          }}
        >
          {results.map((s) => {
            const owned = s.status === "Tenho";
            const dup = s.status === "Repetida";
            const team = teamInfo(s.team);
            const fin = getFinish(s.rarity);
            return (
              <div
                key={s.id}
                onClick={() => {
                  onGoTo(s);
                  onClose();
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceHi; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                style={{
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  borderBottom: `1px solid ${C.border}`,
                  transition: "background .15s",
                }}
              >
                <span style={{ fontSize: 18 }}>{team.flag}</span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: C.t3, minWidth: 46 }}>
                  {s.code}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.name}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 999,
                    padding: "2px 8px",
                    background: owned ? C.greenDim : dup ? fin.bg : C.redDim,
                    color: owned ? C.green : dup ? fin.color : C.red,
                  }}
                >
                  {owned ? "Tenho" : dup ? "Repetida" : "Falta"}
                </span>
              </div>
            );
          })}
          {debouncedQ.trim() && results.length === 0 && (
            <div style={{ fontSize: 12, color: C.t3, padding: "12px 14px", textAlign: "center" }}>
              Nenhuma figurinha encontrada para &quot;{debouncedQ}&quot;
            </div>
          )}
          {!debouncedQ.trim() && (
            <div style={{ textAlign: "center", padding: "32px", color: C.t3, fontSize: 13 }}>
              Digite um código, seleção ou nome para buscar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
