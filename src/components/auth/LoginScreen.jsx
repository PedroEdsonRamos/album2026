import { useState } from "react";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import {
  validateEmail,
  validatePassword,
  translateAuthError,
} from "@/utils/authValidation";

export function LoginScreen({ onGoToSignup, onGoToReset, auth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const e = {};
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr) e.email = emailErr;
    if (passErr) e.password = passErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setAuthError(null);
    const { error } = await auth.signInWithEmail(email, password);
    if (error) setAuthError(translateAuthError(error));
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await auth.signInWithGoogle();
    setGoogleLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
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
        {/* Logo e título */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#fff",
              marginBottom: 4,
            }}
          >
            Álbum Copa 2026
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            PTEC Solutions · Coleção Virtual
          </div>
        </div>

        {/* Card de login */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "28px 24px",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 20,
            }}
          >
            Entrar na sua conta
          </div>

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
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            error={errors.email}
            autoComplete="email"
            disabled={loading}
          />

          <div onKeyDown={handleKeyDown}>
            <AuthInput
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {/* Link esqueci a senha */}
          <div style={{ textAlign: "right", marginBottom: 20, marginTop: -8 }}>
            <button
              onClick={onGoToReset}
              style={{
                background: "none",
                border: "none",
                color: "rgba(245,158,11,0.8)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Esqueci minha senha
            </button>
          </div>

          <AuthButton onClick={handleLogin} loading={loading}>
            Entrar
          </AuthButton>

          {/* Divisor */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "16px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              ou
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Botão Google */}
          <AuthButton
            onClick={handleGoogle}
            loading={googleLoading}
            variant="secondary"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Entrar com Google
          </AuthButton>
        </div>

        {/* Link para cadastro */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Não tem conta?{" "}
          </span>
          <button
            onClick={onGoToSignup}
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
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}
