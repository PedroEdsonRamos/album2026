import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { C } from "@/styles/tokens.js";

const DISMISS_KEY = "installGuideDismissed_v1";

const isStandalone = () =>
  typeof window !== "undefined" &&
  ((window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true);

function detectPlatform() {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
  const ios =
    /iphone|ipad|ipod/i.test(ua) ||
    (typeof navigator !== "undefined" &&
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1);
  if (ios) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 12H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function Step({ icon, children }) {
  return (
    <li style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 14px",
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      color: C.t1, fontSize: 13, lineHeight: 1.4,
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: "50%",
        background: C.amberDim, color: C.amber,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontWeight: 800, fontSize: 13,
      }}>
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

function InstallModal({ platform, deferred, onNative, onClose }) {
  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          zIndex: 2147483646,
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0,
          maxWidth: 480, margin: "0 auto",
          background: "#0c0c1a",
          borderRadius: "20px 20px 0 0",
          border: `1px solid ${C.borderHi}`,
          padding: "20px 18px max(32px, env(safe-area-inset-bottom))",
          zIndex: 2147483647,
          maxHeight: "85vh", overflowY: "auto",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
          animation: "slideUpInstall 0.28s ease",
        }}
      >
        <div style={{
          width: 40, height: 4,
          background: "rgba(255,255,255,0.18)", borderRadius: 999,
          margin: "0 auto 18px",
        }} />

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 16,
        }}>
          <strong style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>
            📲 Instalar o álbum
          </strong>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: "transparent", border: "none",
              color: C.t3, fontSize: 24, cursor: "pointer",
              lineHeight: 1, padding: "2px 4px",
            }}
          >
            ×
          </button>
        </div>

        {platform === "ios" && (
          <>
            <p style={{ color: C.t2, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
              No <strong style={{ color: C.t1 }}>Safari</strong>, siga 3 passos:
            </p>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <Step icon={<ShareIcon />}>
                Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari
              </Step>
              <Step icon="＋">
                Role e toque em <strong>"Adicionar à Tela de Início"</strong>
              </Step>
              <Step icon="✓">
                Toque em <strong>"Adicionar"</strong> no canto superior direito
              </Step>
            </ol>
            <p style={{ color: C.t3, fontSize: 12, margin: "12px 0 0", lineHeight: 1.5, textAlign: "center" }}>
              Não aparece a opção? Certifique-se de estar usando o Safari.
            </p>
          </>
        )}

        {platform === "android" && (
          <>
            {deferred ? (
              <>
                <p style={{ color: C.t2, fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>
                  Instale em 1 toque e abra direto da tela inicial:
                </p>
                <button
                  onClick={onNative}
                  style={{
                    width: "100%",
                    background: `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`,
                    color: "#0c0c1a", fontWeight: 800, fontSize: 15,
                    border: "none", borderRadius: 12, padding: "14px",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Instalar app
                </button>
                <p style={{ color: C.t3, fontSize: 12, margin: "10px 0 0", textAlign: "center" }}>
                  Não funcionou? Use o menu ⋮ → "Instalar app"
                </p>
              </>
            ) : (
              <>
                <p style={{ color: C.t2, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
                  No <strong style={{ color: C.t1 }}>Chrome</strong>, siga 3 passos:
                </p>
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Step icon={<DotsIcon />}>
                    Toque no <strong>menu (⋮)</strong> no canto superior direito
                  </Step>
                  <Step icon="＋">
                    Toque em <strong>"Instalar app"</strong> (ou "Adicionar à tela inicial")
                  </Step>
                  <Step icon="✓">
                    Confirme em <strong>"Instalar"</strong>
                  </Step>
                </ol>
              </>
            )}
          </>
        )}

        {platform === "desktop" && (
          <>
            {deferred ? (
              <>
                <p style={{ color: C.t2, fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>
                  Instale diretamente pelo navegador:
                </p>
                <button
                  onClick={onNative}
                  style={{
                    width: "100%",
                    background: `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`,
                    color: "#0c0c1a", fontWeight: 800, fontSize: 15,
                    border: "none", borderRadius: 12, padding: "14px",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Instalar app
                </button>
              </>
            ) : (
              <>
                <p style={{ color: C.t2, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
                  No <strong style={{ color: C.t1 }}>Chrome</strong> ou <strong style={{ color: C.t1 }}>Edge</strong>:
                </p>
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Step icon="⬇">
                    Clique no ícone de <strong>instalar</strong> na barra de endereço
                  </Step>
                  <Step icon={<DotsIcon />}>
                    Ou abra o menu (⋮) → <strong>"Instalar..."</strong>
                  </Step>
                </ol>
              </>
            )}
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            color: C.t2,
            border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "12px",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", marginTop: 16,
          }}
        >
          Fechar
        </button>
      </div>
      <style>{`@keyframes slideUpInstall { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </>,
    document.body
  );
}

export default function InstallGuide() {
  const [deferred, setDeferred] = useState(null);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [installed, setInstalled] = useState(false);
  const platform = detectPlatform();

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) setHidden(true);
    } catch (e) {}

    const onBIP = (e) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (isStandalone() || installed || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch (e) {}
  };

  const nativeInstall = async () => {
    if (!deferred) { setOpen(true); return; }
    deferred.prompt();
    try { await deferred.userChoice; } catch (e) {}
    setDeferred(null);
    setOpen(false);
  };

  const handlePrimary = () => {
    if (platform === "android" && deferred) {
      nativeInstall();
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <div style={{
        position: "fixed",
        left: 0, right: 0,
        bottom: "calc(64px + 8px)",
        zIndex: 1200,
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 12px",
      }}>
        <div style={{
          background: "rgba(28,28,46,0.98)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 14,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
        }}>
          <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>📲</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: "#fff", fontSize: 14, lineHeight: 1.2 }}>
              Instale o álbum no celular
            </div>
            <div style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>
              Abre da tela inicial, igual a um app.
            </div>
          </div>
          <button
            onClick={handlePrimary}
            style={{
              background: `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`,
              color: "#0c0c1a", fontWeight: 800, fontSize: 13,
              border: "none", borderRadius: 10, padding: "8px 12px",
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {platform === "android" && deferred ? "Instalar" : "Como instalar"}
          </button>
          <button
            onClick={dismiss}
            aria-label="Dispensar"
            style={{
              background: "transparent", border: "none",
              color: C.t3, fontSize: 20, cursor: "pointer",
              lineHeight: 1, padding: "0 2px", flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      </div>
      {open && (
        <InstallModal
          platform={platform}
          deferred={deferred}
          onNative={nativeInstall}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
