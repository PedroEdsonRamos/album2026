import { useState } from "react";
import { AuthLayout, AuthCard } from "./AuthLayout";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateDisplayName,
  translateAuthError,
} from "@/utils/authValidation";
import { checkRateLimit, formatRemainingTime } from "@/utils/rateLimiter";

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
    const { allowed, remainingMs } = checkRateLimit("signup", 3, 300000);
    if (!allowed) {
      setAuthError(`Muitas tentativas. Aguarde ${formatRemainingTime(remainingMs)}.`);
      return;
    }
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
    <AuthLayout
      footerLink={
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Já tem conta?{" "}
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
        </span>
      }
    >
      <AuthCard title="Criar sua conta" error={authError}>
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
          placeholder="Mínimo 6 caracteres"
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
      </AuthCard>
    </AuthLayout>
  );
}
