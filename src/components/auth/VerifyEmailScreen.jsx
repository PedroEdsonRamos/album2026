import { AuthLayout, AuthCard } from "./AuthLayout";

export function VerifyEmailScreen({ email, onGoToLogin }) {
  return (
    <AuthLayout
      footerLink={
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
      }
    >
      <AuthCard title="Verifique seu email">
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>📧</div>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
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
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.6,
            }}
          >
            Clique no link do email para ativar sua conta. Verifique também a
            pasta de spam.
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
