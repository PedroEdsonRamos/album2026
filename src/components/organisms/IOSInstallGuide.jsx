import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Instruções visuais para instalar o PWA no iOS (Safari não tem prompt nativo).
 *
 * Renderizado via PORTAL no document.body: o menu de perfil fica dentro do
 * Header, que usa backdrop-filter — e backdrop-filter cria um containing block
 * que quebra `position: fixed`, deslocando o modal. O portal injeta o modal
 * como filho direto do <body>, fora de qualquer container com filter/transform,
 * fazendo o `position: fixed` funcionar e o modal aparecer no rodapé.
 */
export function IOSInstallGuide({ onClose }) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          zIndex: 2147483646,
        }}
      />
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0,
        maxWidth: 480, margin: "0 auto",
        background: "#0c0c1a",
        borderRadius: "20px 20px 0 0",
        padding: "20px 20px max(32px, env(safe-area-inset-bottom))",
        zIndex: 2147483647,
        maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
        animation: "slideUpIOS 0.3s ease",
      }}>
        <div style={{
          width: 40, height: 4, background: "rgba(255,255,255,0.2)",
          borderRadius: 999, margin: "0 auto 20px",
        }}/>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📲</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
            Instalar no iPhone
          </h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5 }}>
            No Safari, siga estes 3 passos:
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { n: "1", t: "Toque no botão Compartilhar na barra inferior do Safari", i: "⬆︎" },
            { n: "2", t: 'Role e toque em "Adicionar à Tela de Início"', i: "+" },
            { n: "3", t: 'Toque em "Adicionar" no canto superior direito', i: "✓" },
          ].map(s => (
            <div key={s.n} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(245,158,11,0.15)", color: "#fbbf24",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, flexShrink: 0,
              }}>{s.n}</div>
              <div style={{ flex: 1, fontSize: 13, color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>{s.t}</div>
              <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{s.i}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
            color: "#0c0c1a", border: "none", borderRadius: 12,
            padding: "14px", fontSize: 14, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit", marginTop: 20,
            WebkitTapHighlightColor: "transparent",
          }}
        >Entendi</button>
      </div>

      <style>{`
        @keyframes slideUpIOS { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>,
    document.body
  );
}
