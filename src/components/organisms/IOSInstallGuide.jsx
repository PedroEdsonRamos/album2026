/**
 * Instruções visuais para instalar o PWA no iOS (Safari não tem prompt nativo).
 */
export function IOSInstallGuide({ onClose }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 99998,
      }}/>

      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 480,
        margin: "0 auto",
        background: "#0c0c1a",
        borderRadius: "20px 20px 0 0",
        padding: "20px 20px 32px",
        zIndex: 99999,
        animation: "slideUpGuide 0.3s ease",
      }}>
        <div style={{
          width: 40,
          height: 4,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 999,
          margin: "0 auto 20px",
        }}/>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📲</div>
          <h3 style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 6,
          }}>
            Instalar no iPhone
          </h3>
          <p style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
          }}>
            No Safari, siga os 3 passos abaixo:
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Step number="1" icon="□↑" text="Toque no botão de Compartilhar (na barra inferior)" />
          <Step number="2" icon="+" text='Selecione "Adicionar à Tela de Início"' />
          <Step number="3" icon="✓" text='Toque em "Adicionar" no canto superior direito' />
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
            color: "#0c0c1a",
            border: "none",
            borderRadius: 12,
            padding: "14px",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            marginTop: 20,
          }}
        >Entendi</button>
      </div>

      <style>{`
        @keyframes slideUpGuide {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

function Step({ number, icon, text }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "rgba(245,158,11,0.15)",
        color: "#fbbf24",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 800,
        flexShrink: 0,
      }}>{number}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 13,
          color: "#fff",
          fontWeight: 600,
          lineHeight: 1.4,
        }}>
          {text}
        </div>
      </div>
      <span style={{
        fontSize: 16,
        color: "rgba(255,255,255,0.4)",
        fontWeight: 700,
      }}>{icon}</span>
    </div>
  );
}
