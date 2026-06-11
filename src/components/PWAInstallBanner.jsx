import { useState, useEffect } from "react";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    const dismissedAt = localStorage.getItem("pwa-dismissed-at");
    if (dismissedAt) {
      const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < 7) return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (iOS) {
      const timer = setTimeout(() => setShow(true), 30000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-dismissed-at", Date.now().toString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      left: 16,
      right: 16,
      background: "rgba(28,28,46,0.98)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(245,158,11,0.3)",
      borderRadius: 16,
      padding: 16,
      zIndex: 9999,
      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      display: "flex",
      gap: 12,
      alignItems: "center",
      maxWidth: 480,
      margin: "0 auto",
    }}>
      <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>🏆</div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
          Instale o Álbum na tela inicial
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
          {isIOS
            ? "Toque em Compartilhar e depois \"Adicionar à Tela de Início\""
            : "Acesso rápido como um aplicativo nativo"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {!isIOS && (
          <button
            onClick={handleInstall}
            style={{
              background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
              border: "none",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 800,
              color: "#000",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            Instalar
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "6px 14px",
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
