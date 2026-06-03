import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "./AuthLayout";
import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";
import { validatePassword, validatePasswordConfirm, translateAuthError } from "@/utils/authValidation";

export function ResetPasswordConfirmScreen({ onSuccess }) {
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    // Implicit flow: tokens no hash
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    }
    // PKCE flow: Supabase já trocou o token via detectSessionInUrl — nada a fazer
  }, []);

  const validate = () => {
    const e = {};
    const passErr    = validatePassword(newPassword);
    const confirmErr = validatePasswordConfirm(newPassword, confirmPassword);
    if (passErr)    e.password = passErr;
    if (confirmErr) e.confirm  = confirmErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setAuthError(translateAuthError(error));
    } else {
      setDone(true);
      setTimeout(() => onSuccess(), 2000);
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "28px 24px",
        backdropFilter: "blur(20px)",
      }}>
        {!done ? (
          <>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              🔑 Redefinir senha
            </div>
            <div style={{
              fontSize: 12, color: "rgba(255,255,255,0.4)",
              marginBottom: 20, lineHeight: 1.6,
            }}>
              Digite sua nova senha abaixo.
              Ela deve ter no mínimo 6 caracteres.
            </div>

            {authError && (
              <div style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 12, color: "#f87171", marginBottom: 16,
              }}>
                ⚠️ {authError}
              </div>
            )}

            <AuthInput
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              error={errors.password}
              autoComplete="new-password"
              disabled={loading}
            />

            <AuthInput
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              error={errors.confirm}
              autoComplete="new-password"
              disabled={loading}
            />

            <AuthButton onClick={handleReset} loading={loading}>
              Redefinir senha
            </AuthButton>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
              Senha redefinida!
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
              Sua senha foi alterada com sucesso.
              <br />Redirecionando para o app...
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
