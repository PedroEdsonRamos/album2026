import { C } from "@/styles/tokens.js";

/**
 * Seletor de abas (segmented control) reutilizável.
 * @param {Array<{id:string, label:string, featured?:boolean}>} items
 * @param {string} value     id do item ativo
 * @param {(id:string)=>void} onChange
 */
export function SegmentedTabs({ items = [], value, onChange }) {
  return (
    <div
      role="tablist"
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
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(it.id)}
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
              whiteSpace: "nowrap",
            }}
          >
            {it.featured ? "★ " : ""}{it.label}
          </button>
        );
      })}
    </div>
  );
}
