import { Icon } from "@/components/atoms/Icon.jsx";
import { FIFATrophy } from "@/components/atoms/FIFATrophy.jsx";
import { SyncIndicator } from "@/components/atoms/SyncIndicator.jsx";
import { C } from "@/styles/tokens.js";
import { UserMenu } from "@/components/organisms/UserMenu.jsx";

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
        padding: "40px 18px 10px",
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
