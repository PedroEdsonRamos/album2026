export function VerifyEmailScreen({ email, onGoToLogin }) {
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
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📧</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 12,
          }}
        >
          Verifique seu email
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "28px 24px",
            marginBottom: 24,
            backdropFilter: "blur(20px)",
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              marginBottom: 16,
            }}
          >
            Enviamos um link de confirmação para:
          </p>
          <div
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 700,
              color: "#f59e0b",
              marginBottom: 16,
            }}
          >
            {email}
          </div>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.6,
            }}
          >
            Clique no link do email para ativar sua conta. Verifique também a
            pasta de spam.
          </p>
        </div>
        <button
          onClick={onGoToLogin}
          style={{
            background: "none",
            border: "none",
            color: "#f59e0b",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Voltar para o login
        </button>
      </div>
    </div>
  );
}
