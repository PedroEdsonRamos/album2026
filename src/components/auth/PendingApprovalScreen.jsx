import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { C } from "@/styles/tokens.js";

export function PendingApprovalScreen({ auth }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Erro ao iniciar pagamento. Tente novamente.");
      }
    } catch {
      setError("Erro ao conectar. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0c1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      textAlign: "center",
      fontFamily: "'Sora','DM Sans',system-ui,sans-serif",
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>

      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
        Álbum Copa do Mundo 2026
      </h1>
      <p style={{ color: C.t3, fontSize: 14, margin: "0 0 32px", maxWidth: 320, lineHeight: 1.7 }}>
        Você está no modo demonstração. Para marcar figurinhas, registrar trocas
        e usar todas as funcionalidades, desbloqueie o acesso completo.
      </p>

      <div style={{
        background: C.surface,
        border: `1px solid ${C.amber}`,
        borderRadius: 16,
        padding: "24px 32px",
        marginBottom: 24,
        maxWidth: 320,
        width: "100%",
      }}>
        <div style={{ color: C.t3, fontSize: 13, marginBottom: 4 }}>Acesso completo e vitalício</div>
        <div style={{ color: "#fff", fontSize: 40, fontWeight: 900, lineHeight: 1 }}>
          R$ 7<span style={{ fontSize: 20 }}>,00</span>
        </div>
        <div style={{ color: C.t3, fontSize: 12, marginTop: 4 }}>pagamento único</div>

        <ul style={{
          listStyle: "none",
          padding: 0,
          margin: "20px 0 0",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          {[
            "✅ Marcar e gerenciar figurinhas",
            "✅ Registrar e trocar repetidas",
            "✅ Trocas por link com outros usuários",
            "✅ Acompanhar jogos da Copa",
            "✅ Instalar como app no celular",
          ].map((item) => (
            <li key={item} style={{ color: C.t2, fontSize: 13 }}>{item}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: "100%",
          maxWidth: 320,
          padding: "14px 20px",
          background: loading ? C.border : C.amber,
          color: loading ? C.t3 : "#0c0c1a",
          border: "none",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 800,
          cursor: loading ? "default" : "pointer",
          fontFamily: "inherit",
          marginBottom: 12,
          transition: "all .2s",
        }}
      >
        {loading ? "Redirecionando..." : "Desbloquear por R$ 7,00"}
      </button>

      {error && (
        <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>
      )}

      <p style={{ color: C.t3, fontSize: 11, margin: "8px 0 0", maxWidth: 320, lineHeight: 1.4 }}>
        💳 Cartão: acesso liberado na hora.<br/>
        🧾 Boleto: acesso liberado após a compensação (até 3 dias úteis).
      </p>

      <button
        onClick={() => auth.checkApproval(auth.user?.id)}
        style={{
          background: "transparent",
          border: "none",
          color: C.t3,
          fontSize: 12,
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "underline",
          marginBottom: 24,
        }}
      >
        Já paguei — verificar acesso
      </button>

      <button
        onClick={async () => {
          if (!confirm("Deseja sair da conta?")) return;
          await auth.signOut();
        }}
        style={{
          background: "transparent",
          border: "none",
          color: C.t4,
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Sair da conta
      </button>
    </div>
  );
}
