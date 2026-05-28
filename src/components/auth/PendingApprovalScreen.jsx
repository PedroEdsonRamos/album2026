import { useState } from "react";
import { AuthLayout } from "./AuthLayout";

export function PendingApprovalScreen({ auth }) {
  const [checking, setChecking] = useState(false);
  const [checked, setChecked]   = useState(false);

  const handleCheckAgain = async () => {
    setChecking(true);
    setChecked(false);
    await auth.checkApproval(auth.user?.id);
    setChecked(true);
    setChecking(false);
  };

  const handleLogout = async () => {
    if (!confirm("Deseja sair da conta?")) return;
    await auth.signOut();
  };

  return (
    <AuthLayout>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "32px 24px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        textAlign: "center",
      }}>

        <div style={{ fontSize: 52, marginBottom: 16, animation: "pulse 2s infinite" }}>
          ⏳
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
          Cadastro em análise
        </div>

        <div style={{
          fontSize: 13, color: "rgba(255,255,255,0.45)",
          lineHeight: 1.7, marginBottom: 24,
        }}>
          Seu cadastro foi recebido e está sendo analisado.
          <br />
          Você receberá acesso assim que for aprovado.
        </div>

        <div style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 12, padding: "12px 16px",
          marginBottom: 24, fontSize: 13,
          color: "rgba(245,158,11,0.8)",
        }}>
          📧 {auth.user?.email}
        </div>

        {checked && (
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "10px 14px",
            marginBottom: 16, fontSize: 12,
            color: "rgba(255,255,255,0.4)",
          }}>
            Acesso ainda não liberado. Aguarde a aprovação.
          </div>
        )}

        <button
          onClick={handleCheckAgain}
          disabled={checking}
          style={{
            width: "100%", padding: "13px",
            background: checking
              ? "rgba(245,158,11,0.2)"
              : "linear-gradient(135deg, #f59e0b, #fbbf24)",
            border: "none", borderRadius: 12,
            color: "#000", fontSize: 14, fontWeight: 800,
            cursor: checking ? "not-allowed" : "pointer",
            fontFamily: "inherit", marginBottom: 10, transition: "all .2s",
          }}>
          {checking ? "Verificando..." : "🔄 Verificar aprovação"}
        </button>

        <button
          onClick={handleLogout}
          style={{
            width: "100%", padding: "13px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, color: "rgba(255,255,255,0.4)",
            fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>
          Sair da conta
        </button>

      </div>
    </AuthLayout>
  );
}
