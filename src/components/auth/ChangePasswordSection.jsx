import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { validatePassword, translateAuthError } from "@/utils/authValidation";

export function ChangePasswordSection({ auth, addToast }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [authError, setAuthError] = useState(null);
  const [open, setOpen]         = useState(false);

  const validate = () => {
    const e = {};
    if (!currentPassword) e.current = "Senha atual obrigatória";
    const passErr = validatePassword(newPassword);
    if (passErr) e.new = passErr;
    else if (newPassword === currentPassword) e.new = "A nova senha deve ser diferente da atual";
    if (newPassword !== confirmPassword) e.confirm = "As senhas não coincidem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = async () => {
    if (!validate()) return;
    setSaving(true);
    setAuthError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: auth.user.email,
      password: currentPassword,
    });

    if (signInError) {
      setAuthError("Senha atual incorreta");
      setSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setAuthError(translateAuthError(error));
    } else {
      setSaved(true);
      addToast?.("Senha alterada com sucesso ✓", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setTimeout(() => { setSaved(false); setOpen(false); }, 2500);
    }
    setSaving(false);
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${hasError ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 16,
    color: "#fff",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  });

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 6,
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "18px 20px",
      marginBottom: 12,
    }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
            🔑 Alterar senha
          </div>
          {!open && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
              Clique para alterar sua senha de acesso
            </div>
          )}
        </div>
        <span style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 12,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .2s",
          display: "inline-block",
        }}>▾</span>
      </div>

      {open && (
        <div style={{ marginTop: 16 }}>
          {authError && (
            <div style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              color: "#f87171",
              marginBottom: 14,
            }}>
              ⚠️ {authError}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Senha atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle(errors.current)}
            />
            {errors.current && (
              <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.current}</div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={inputStyle(errors.new)}
            />
            {errors.new && (
              <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.new}</div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              style={inputStyle(errors.confirm)}
            />
            {errors.confirm && (
              <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.confirm}</div>
            )}
          </div>

          <button
            onClick={handleChange}
            disabled={saving}
            style={{
              width: "100%",
              padding: "13px",
              background: saved
                ? "rgba(34,197,94,0.2)"
                : saving
                ? "rgba(245,158,11,0.3)"
                : "linear-gradient(135deg, #f59e0b, #fbbf24)",
              border: saved ? "1px solid rgba(34,197,94,0.4)" : "none",
              borderRadius: 12,
              color: saved ? "#4ade80" : "#000",
              fontSize: 14,
              fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
            }}
          >
            {saved ? "✓ Senha alterada!" : saving ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      )}
    </div>
  );
}
