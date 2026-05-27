import { useState } from "react";
import { Icon } from "@/components/atoms/Icon.jsx";
import { FIFATrophy } from "@/components/atoms/FIFATrophy.jsx";
import { SyncIndicator } from "@/components/atoms/SyncIndicator.jsx";
import { C } from "@/styles/tokens.js";

function UserMenu({ user, onLogout, onProfile }) {
  const [open, setOpen] = useState(false);

  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(245,158,11,0.18)",
          border: "1.5px solid rgba(245,158,11,0.4)",
          color: "#f59e0b",
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
          flexShrink: 0,
        }}
      >
        {initials}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 90 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 100,
              background: "#1a1a2e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              padding: "8px",
              minWidth: 180,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                padding: "8px 10px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                {user?.user_metadata?.full_name ?? "Usuário"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 160,
                }}
              >
                {user?.email}
              </div>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                onProfile();
              }}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              👤 Meu perfil
            </button>

            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "#f87171",
                fontSize: 13,
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "rgba(248,113,113,0.08)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              🚪 Sair da conta
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Header({
  page,
  selectedTeam,
  onBack,
  onSearchOpen,
  auth,
  onLogout,
  onProfile,
  syncStatus,
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(12,12,26,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "11px 18px 10px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {page === "stickers" && selectedTeam && (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: C.t2,
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
            lineHeight: 0,
          }}
        >
          <Icon name="back" size={20} />
        </button>
      )}
      <div
        style={{
          filter: `drop-shadow(0 2px 6px ${C.amberGlow})`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <FIFATrophy size={32} />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            background: `linear-gradient(90deg,${C.amber},${C.amberLt})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
          }}
        >
          FIFA WORLD CUP 2026
        </div>
        <div
          style={{
            fontSize: 9,
            color: C.t3,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            lineHeight: 1.2,
          }}
        >
          COLEÇÃO VIRTUAL · 994 FIGURINHAS
        </div>
      </div>
      <button
        onClick={onSearchOpen}
        style={{
          background: C.surface,
          border: `1px solid ${C.borderHi}`,
          borderRadius: 10,
          width: 38,
          height: 38,
          color: C.amber,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name="search" size={18} />
      </button>
      {auth?.user && (
        <>
          <SyncIndicator status={syncStatus} />
          <UserMenu
            user={auth.user}
            onLogout={onLogout}
            onProfile={onProfile}
          />
        </>
      )}
    </div>
  );
}
