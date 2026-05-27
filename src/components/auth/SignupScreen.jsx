import { useState } from "react";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateDisplayName,
  translateAuthError,
} from "@/utils/authValidation";

export function SignupScreen({ onGoToLogin, auth, onSignupSuccess }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    const nameErr = validateDisplayName(displayName);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validatePasswordConfirm(password, confirm);
    if (nameErr) e.displayName = nameErr;
    if (emailErr) e.email = emailErr;
    if (passErr) e.password = passErr;
    if (confirmErr) e.confirm = confirmErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    setAuthError(null);
    const { error } = await auth.signUp(email, password, displayName);
    if (error) {
      setAuthError(translateAuthError(error));
    } else {
      onSignupSuccess(email);
    }
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
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🏆</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
            Criar sua conta
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              marginTop: 4,
            }}
          >
            Álbum Copa 2026 · PTEC Solutions
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
          {authError && (
            <div
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                color: "#f87171",
                marginBottom: 16,
              }}
            >
              ⚠️ {authError}
            </div>
          )}

          <AuthInput
            label="Como quer ser chamado?"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Seu nome"
            error={errors.displayName}
            autoComplete="name"
            disabled={loading}
          />

          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            error={errors.email}
            autoComplete="email"
            disabled={loading}
          />

          <AuthInput
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mín. 8 caracteres com letra e número"
            error={errors.password}
            autoComplete="new-password"
            disabled={loading}
          />

          <AuthInput
            label="Confirmar senha"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            error={errors.confirm}
            autoComplete="new-password"
            disabled={loading}
          />

          <AuthButton onClick={handleSignup} loading={loading}>
            Criar conta
          </AuthButton>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Já tem conta?{" "}
          </span>
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
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
