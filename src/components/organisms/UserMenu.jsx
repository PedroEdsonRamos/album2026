import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall.js";
import { IOSInstallGuide } from "@/components/organisms/IOSInstallGuide.jsx";

export function UserMenu({ user, onLogout, onProfile }) {
  const [open, setOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();

  // Só mostra a opção se NÃO estiver instalado E for possível instalar
  const showInstallOption = !isInstalled && (canInstall || isIOS);

  async function handleInstallClick() {
    setOpen(false);
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    await promptInstall();
  }

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
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99998, background: "transparent", cursor: "default" }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 99999,
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

            {showInstallOption && (
              <button
                onClick={handleInstallClick}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  color: "#fbbf24",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(245,158,11,0.1)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                📲 Instalar o app
              </button>
            )}

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

      {showIOSGuide && (
        <IOSInstallGuide onClose={() => setShowIOSGuide(false)} />
      )}
    </div>
  );
}
