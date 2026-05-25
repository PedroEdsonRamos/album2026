import { useState } from "react";
import { C } from "@/styles/tokens.js";

export function ResetModal({ onClose, onConfirm, ownedCount }) {
  const [step, setStep] = useState(1);
  const [resetting, setResetting] = useState(false);

  const handleConfirm = () => {
    setResetting(true);
    setTimeout(() => {
      onConfirm();
    }, 100);
  };

  const btnCancel = {
    flex: 1,
    background: C.surface,
    border: `1px solid ${C.borderHi}`,
    color: C.t2,
    borderRadius: 12,
    padding: "12px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const btnContinue = {
    flex: 2,
    background: `linear-gradient(135deg,${C.amber},${C.amberLt})`,
    border: "none",
    borderRadius: 12,
    padding: "12px",
    fontSize: 13,
    fontWeight: 800,
    color: "#000",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const btnReset = {
    flex: 2,
    background: "rgba(248,113,113,0.18)",
    border: `1px solid rgba(248,113,113,0.5)`,
    color: C.red,
    borderRadius: 12,
    padding: "12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 8000,
        background: "rgba(6,6,14,0.88)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.panelHi,
          border: "1px solid rgba(248,113,113,0.4)",
          borderRadius: 20,
          padding: 24,
          width: "100%",
          maxWidth: 340,
          animation: "fadeIn .25s ease",
        }}
      >
        {step === 1 && (
          <>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", textAlign: "center", marginBottom: 8 }}>
              Resetar Álbum?
            </div>
            <div style={{ fontSize: 13, color: C.t2, textAlign: "center", lineHeight: 1.6, marginBottom: 24 }}>
              Esta ação irá apagar <strong style={{ color: "#fff" }}>todas</strong> as figurinhas
              marcadas como coletadas. Esta ação não pode ser desfeita.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={btnCancel}>Cancelar</button>
              <button onClick={() => setStep(2)} style={btnContinue}>Continuar →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🚨</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: C.red, textAlign: "center", marginBottom: 8 }}>
              Tem certeza absoluta?
            </div>
            <div style={{ fontSize: 13, color: C.t2, textAlign: "center", lineHeight: 1.6, marginBottom: 24 }}>
              Todas as suas <strong style={{ color: "#fff" }}>{ownedCount} figurinhas</strong> coletadas
              serão perdidas permanentemente.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(1)} style={btnCancel} disabled={resetting}>← Voltar</button>
              <button onClick={handleConfirm} disabled={resetting} style={{ ...btnReset, opacity: resetting ? 0.6 : 1, cursor: resetting ? "default" : "pointer" }}>⚠️ Resetar tudo</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
