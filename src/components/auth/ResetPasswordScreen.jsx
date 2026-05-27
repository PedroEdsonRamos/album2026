import { useState } from "react";
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
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🔑</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
            Recuperar senha
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "28px 24px",
            backdropFilter: "blur(20px)",
          }}
        >
          {!sent ? (
            <>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 20,
                  lineHeight: 1.6,
                }}
              >
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>
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
              <div style={{ fontSize: 42, marginBottom: 16 }}>📧</div>
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
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.6,
                }}
              >
                Verifique sua caixa de entrada em{" "}
                <strong style={{ color: "#fff" }}>{email}</strong> e clique no
                link para redefinir sua senha.
              </p>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
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
    </div>
  );
}
