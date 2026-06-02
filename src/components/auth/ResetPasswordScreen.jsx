import { useState } from "react";
import { AuthLayout, AuthCard } from "./AuthLayout";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { validateEmail, translateAuthError } from "@/utils/authValidation";
import { checkRateLimit, formatRemainingTime } from "@/utils/rateLimiter";

export function ResetPasswordScreen({ onGoToLogin, auth, initialEmail = "" }) {
  const [email, setEmail]       = useState(initialEmail);
  const [error, setError]       = useState(null);
  const [sent, setSent]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  const handleReset = async () => {
    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }

    const { allowed, remainingMs } = checkRateLimit("reset", 3, 300000);
    if (!allowed) {
      setError(`Muitas tentativas. Aguarde ${formatRemainingTime(remainingMs)}.`);
      return;
    }

    setLoading(true);
    setError(null);

    const { error: resetError } = await auth.resetPassword(email);

    if (resetError) {
      const msg = resetError.message?.toLowerCase() ?? "";
      if (
        msg.includes("oauth") ||
        msg.includes("google") ||
        msg.includes("social") ||
        msg.includes("provider")
      ) {
        setIsOAuthUser(true);
      } else {
        setError(translateAuthError(resetError));
      }
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  const footerBack = (
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
  );

  if (isOAuthUser) {
    return (
      <AuthLayout footerLink={footerBack}>
        <AuthCard title="Conta Google detectada">
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔑</div>
            <p style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
              marginBottom: 20,
            }}>
              Este email está vinculado a uma conta Google.
              Você não precisa de senha para entrar.
            </p>
            <AuthButton onClick={onGoToLogin}>
              <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Entrar com Google
            </AuthButton>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout footerLink={footerBack}>
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
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>
              Email enviado!
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              Verifique sua caixa de entrada em{" "}
              <strong style={{ color: "#fff" }}>{email}</strong> e clique
              no link para redefinir sua senha.
              Verifique também a pasta de spam.
            </p>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
