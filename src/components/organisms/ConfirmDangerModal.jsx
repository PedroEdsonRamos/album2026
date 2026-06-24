import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Modal de confirmação destrutiva em 2 passos.
 * Renderizado via portal pra ficar acima de qualquer stacking context.
 */
export function ConfirmDangerModal({ open, onClose, onConfirm }) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  if (!open) return null;

  const overlay = {
    position: "fixed", inset: 0, zIndex: 100000,
    background: "rgba(0,0,0,0.6)", display: "flex",
    alignItems: "center", justifyContent: "center", padding: 20,
  };
  const box = {
    width: "100%", maxWidth: 360, background: "#1a1a2e",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16,
    padding: 20, boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
  };
  const danger = {
    width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
    background: "#dc2626", color: "#fff", fontWeight: 800, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
  };
  const cancel = {
    width: "100%", padding: "11px 0", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
    color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit", marginTop: 8,
  };

  return createPortal(
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        {step === 1 ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 10 }}>
              Limpar figurinhas repetidas?
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 16 }}>
              Isso remove <b style={{ color: "#fff" }}>todas</b> as suas figurinhas repetidas.
              Você mantém 1 cópia de cada — as do álbum continuam intactas.
            </div>
            <button type="button" style={danger} onClick={() => setStep(2)}>Continuar</button>
            <button type="button" style={cancel} onClick={onClose}>Cancelar</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fca5a5", marginBottom: 10 }}>
              Tem certeza absoluta?
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 16 }}>
              Esta ação <b style={{ color: "#fca5a5" }}>não pode ser desfeita</b>. Suas repetidas serão zeradas.
            </div>
            <button type="button" style={danger} onClick={() => { onConfirm?.(); onClose(); }}>
              Apagar definitivamente
            </button>
            <button type="button" style={cancel} onClick={onClose}>Cancelar</button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
