import { PTECLogo } from "@/components/atoms/PTECLogo";

export function AuthLayout({ children, footerLink }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0c0c1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Header: troféu + título */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src="/trophy_title.png"
            alt="Troféu FIFA World Cup 2026"
            style={{
              height: 64,
              display: "block",
              margin: "0 auto 14px",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div
            style={{
              color: "#f59e0b",
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            FIFA WORLD CUP 2026
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            COLEÇÃO VIRTUAL
          </div>
        </div>

        {/* Conteúdo da tela (card) */}
        {children}

        {/* Link de navegação */}
        {footerLink && (
          <div style={{ textAlign: "center", marginTop: 20 }}>{footerLink}</div>
        )}

        {/* Rodapé */}
        <div
          style={{
            background: "#0c0c1a",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            marginTop: 32,
            width: "100%",
            maxWidth: 480,
            position: "relative",
            overflow: "visible",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px 80px 10px 16px",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 8.5,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              DESENVOLVIDO POR
            </div>
            <div
              style={{
                fontSize: 8.5,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              © 2026 PTEC SOLUTIONS · DIREITOS RESERVADOS
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <PTECLogo height={58} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthCard({ title, subtitle, children, error }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "28px 24px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#fff",
            marginBottom: subtitle ? 4 : 20,
          }}
        >
          {title}
        </div>
      )}
      {subtitle && (
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      )}
      {error && (
        <div
          style={{
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            color: "#f87171",
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          ⚠️ {error}
        </div>
      )}
      {children}
    </div>
  );
}
