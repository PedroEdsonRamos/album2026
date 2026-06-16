import { useState, useEffect } from "react";

/**
 * Hook que gerencia a instalação do PWA.
 * Retorna:
 *  - canInstall: boolean → se há prompt nativo disponível
 *  - isInstalled: boolean → se já está instalado
 *  - isIOS: boolean → iOS não tem prompt nativo
 *  - promptInstall: função para disparar o prompt (Android/Chrome)
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // iOS detection
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Já instalado?
    const standalone = window.matchMedia("(display-mode: standalone)").matches
                     || window.navigator.standalone === true;
    setIsInstalled(standalone);

    // Captura o evento de prompt nativo
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Quando instalado, atualiza estado
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isIOS,
    promptInstall,
  };
}
