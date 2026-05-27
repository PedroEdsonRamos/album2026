import { useState } from "react";
import { AuthLayout, AuthCard } from "./AuthLayout";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { validateEmail, translateAuthError } from "@/utils/authValidation";

export function ResetPasswordScreen({ onGoToLogin, auth }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setLoading(true);
    const { error: resetError } = await auth.resetPassword(email);
    if (resetError) setError(translateAuthError(resetError));
    else setSent(true);
    setLoading(false);
  };

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
      <AuthCard
        title="Recuperar senha"
        subtitle="Digite seu email e enviaremos um link para redefinir sua senha."
        error={!sent ? error : null}
      >
        {!sent ? (
          <>
            <AuthInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="seu@email.com"
              error={error}
              disabled={loading}
            />
            <AuthButton onClick={handleReset} loading={loading}>
              Enviar link de recuperação
            </AuthButton>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📧</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 10,
              }}
            >
              Email enviado!
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.7,
              }}
            >
              Verifique sua caixa de entrada em{" "}
              <strong style={{ color: "#fff" }}>{email}</strong> e clique no
              link para redefinir sua senha. Verifique também a pasta de spam.
            </p>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
