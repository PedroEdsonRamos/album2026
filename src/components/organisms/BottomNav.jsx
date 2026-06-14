import { Icon } from "@/components/atoms/Icon.jsx";
import { BallIcon } from "@/components/icons/BallIcon.jsx";
import { C } from "@/styles/tokens.js";

const NAV_ITEMS = [
  { id: "dashboard", label: "Início", icon: "home" },
  { id: "teams", label: "Seleções", icon: "flag" },
  { id: "stickers", label: "Álbum", icon: "grid" },
  { id: "add", label: "Adicionar", icon: "plus" },
  { id: "trocas", label: "Trocas", icon: "swap" },
  { id: "status", label: "Status", icon: "chart" },
  { id: "ajuda",  label: "Ajuda",  icon: "help-circle" },
  { id: "jogos",  label: "Jogos",  icon: <BallIcon size={20} /> },
];

export function BottomNav({ page, onNav }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        zIndex: 100,
        background: "rgba(12,12,26,0.92)",
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        padding: "8px 0 max(8px,env(safe-area-inset-bottom))",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = page === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "4px 0",
              color: active ? C.amber : C.t3,
              transition: "color 0.2s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div
              style={{
                background: active ? C.amberDim : "transparent",
                borderRadius: 10,
                padding: "4px 12px",
                transition: "background 0.2s",
              }}
            >
              {typeof item.icon === "string"
                ? <Icon name={item.icon} size={20} />
                : item.icon}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
