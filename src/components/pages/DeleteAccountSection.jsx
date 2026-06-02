import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { deleteUserAccount } from "@/services/syncService.js";

export function DeleteAccountSection({ auth }) {
  const [step, setStep]         = useState(0);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState(null);

  const isGoogle = auth.isGoogleUser;

  const handleDelete = async () => {
    if (isGoogle) {
      if (password !== "EXCLUIR") { setError("Digite EXCLUIR para confirmar"); return; }
    } else {
      if (!password) { setError("Digite sua senha para confirmar"); return; }
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: auth.user.email,
        password,
      });
      if (authError) {
        setError("Senha incorreta. Conta não foi excluída.");
        setDeleting(false);
        return;
      }
    }

    setDeleting(true);
    setError(null);

    const { ok, error: deleteError } = await deleteUserAccount(auth.user.id);

    if (!ok) {
      setError(deleteError ?? "Erro ao excluir conta. Tente novamente.");
      setDeleting(false);
    }
  };

  const btnBase = {
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "12px",
  };

  return (
    <div style={{
      background: "rgba(248,113,113,0.06)",
      border: "1px solid rgba(248,113,113,0.2)",
      borderRadius: 16,
      padding: "18px 20px",
      marginTop: 8,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: "rgba(255,255,255,0.3)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 12,
      }}>
        Zona de perigo
      </div>

      {step === 0 && (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>
            🗑️ Excluir minha conta
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 14 }}>
            Esta ação é permanente e irreversível. Todos os seus dados,
            incluindo sua coleção de figurinhas, serão apagados.
          </div>
          <button
            onClick={() => setStep(1)}
            style={{
              ...btnBase,
              width: "100%",
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.35)",
              color: "#f87171",
            }}
          >
            Excluir minha conta
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>
            ⚠️ Tem certeza?
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 16 }}>
            Você perderá permanentemente:
            <br />• Sua coleção de figurinhas
            <br />• Seu histórico de trocas
            <br />• Sua conta e dados de perfil
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setStep(0)}
              style={{
                ...btnBase,
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => setStep(2)}
              style={{
                ...btnBase,
                flex: 2,
                background: "rgba(248,113,113,0.15)",
                border: "1px solid rgba(248,113,113,0.4)",
                color: "#f87171",
              }}
            >
              Continuar →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>
            🚨 Confirmação final
          </div>

          {error && (
            <div style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              color: "#f87171",
              marginBottom: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          {isGoogle ? (
            <>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.6 }}>
                Sua conta está vinculada ao Google. Digite{" "}
                <strong style={{ color: "#fff" }}>EXCLUIR</strong> para confirmar.
              </div>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite EXCLUIR"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(248,113,113,0.4)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 14,
                  color: "#fff",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 14,
                }}
              />
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.6 }}>
                Digite sua senha para confirmar a exclusão da conta.
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha atual"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(248,113,113,0.4)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 14,
                  color: "#fff",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 14,
                }}
              />
            </>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setStep(0); setPassword(""); setError(null); }}
              style={{
                ...btnBase,
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
              }}
            >
              ← Voltar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                ...btnBase,
                flex: 2,
                background: deleting ? "rgba(248,113,113,0.1)" : "rgba(248,113,113,0.85)",
                border: "none",
                color: "#fff",
                cursor: deleting ? "not-allowed" : "pointer",
              }}
            >
              {deleting ? "Excluindo..." : "⚠️ Excluir permanentemente"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
