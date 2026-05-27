import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/components/atoms/Icon.jsx";
import { sanitizeName } from "@/utils/sanitize";
import { ChangePasswordSection } from "@/components/auth/ChangePasswordSection.jsx";
import { ExportDataSection } from "@/components/pages/ExportDataSection.jsx";
import { DeleteAccountSection } from "@/components/pages/DeleteAccountSection.jsx";

export function Profile({ auth, stickers, setPage }) {
  const [displayName, setDisplayName] = useState(
    auth.user?.user_metadata?.full_name ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    const cleanName = sanitizeName(displayName);
    if (!cleanName) {
      setError("Nome inválido");
      return;
    }
    setSaving(true);
    setError(null);

    const { error: saveError } = await supabase.auth.updateUser({
      data: { full_name: cleanName },
    });

    if (saveError) {
      setError("Erro ao salvar. Tente novamente.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  const avatarInitials = (
    auth.user?.user_metadata?.full_name ??
    auth.user?.email ??
    "?"
  )
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ paddingBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <button
          onClick={() => setPage("dashboard")}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <Icon name="back" size={20} />
        </button>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
          Meu Perfil
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(245,158,11,0.15)",
            border: "2px solid rgba(245,158,11,0.4)",
            color: "#f59e0b",
            fontSize: 26,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          {avatarInitials}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
          {auth.user?.user_metadata?.full_name ?? "Usuário"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            marginTop: 3,
          }}
        >
          {auth.user?.email}
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "20px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
          }}
        >
          Informações da conta
        </div>

        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              color: "#f87171",
              marginBottom: 14,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 6,
            }}
          >
            Nome
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 14,
              color: "#fff",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <div
            style={{
              padding: "12px 16px",
              fontSize: 14,
              color: "rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
            }}
          >
            {auth.user?.email}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.2)",
              marginTop: 4,
            }}
          >
            O email não pode ser alterado
          </div>
        </div>

        <button
          onClick={handleSave}
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
          {saved ? "✓ Salvo!" : saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      <ChangePasswordSection auth={auth} />

      <ExportDataSection auth={auth} stickers={stickers} />

      <DeleteAccountSection auth={auth} />

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          Conta criada em
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          {new Date(auth.user?.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
