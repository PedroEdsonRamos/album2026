import { useEffect, useRef } from "react";

/**
 * Detecta quando o app volta ao foco após navegar para app externo (ex: WhatsApp).
 * Corrige tela branca no PWA em modo standalone.
 */
export function useAppVisibility(onReturn) {
  const wasHidden = useRef(false);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        wasHidden.current = true;
      } else if (wasHidden.current) {
        wasHidden.current = false;
        if (typeof onReturn === "function") {
          onReturn();
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [onReturn]);
}
