import { useState } from "react";
import { clearStorage, clearServiceWorkerCache } from "@/services/storage.js";
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

            <div style={{
              marginTop: 16, padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, fontSize: 11, color: C.t3, lineHeight: 1.6,
            }}>
              <strong style={{ color: C.t2 }}>💡 Se as figurinhas ainda aparecerem após o reset:</strong>
              <br />1. Feche e reabra o aplicativo
              <br />2. Se persistir, limpe o cache do navegador:
              <br /><span style={{ fontFamily: "monospace", fontSize: 10 }}>Chrome/Edge: F12 → Application → Storage → Clear site data</span>
              <br /><span style={{ fontFamily: "monospace", fontSize: 10 }}>Safari iOS: Ajustes → Safari → Limpar histórico e dados</span>
            </div>

            <button
              onClick={async () => {
                clearStorage();
                await clearServiceWorkerCache();
                if ("serviceWorker" in navigator) {
                  const regs = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(regs.map((r) => r.unregister()));
                }
                window.location.reload();
              }}
              style={{
                marginTop: 8, width: "100%", background: "transparent",
                border: `1px solid ${C.borderHi}`, color: C.t3,
                borderRadius: 10, padding: "8px", fontSize: 11,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              🔄 Limpar cache e reiniciar app
            </button>
          </>
        )}
      </div>
    </div>
  );
}
