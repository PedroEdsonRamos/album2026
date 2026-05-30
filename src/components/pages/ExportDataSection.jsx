import { useState } from "react";

export function ExportDataSection({ auth, stickers, addToast }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        email: auth.user.email,
        name: auth.user.user_metadata?.full_name ?? "",
        createdAt: auth.user.created_at,
      },
      collection: {
        total: stickers.length,
        owned: stickers.filter((s) => s.status === "Tenho").length,
        repeated: stickers.filter((s) => s.status === "Repetida").length,
        missing: stickers.filter((s) => s.status === "Faltando").length,
        stickers: stickers
          .filter((s) => s.status !== "Faltando")
          .map((s) => ({
            code: s.code,
            name: s.name,
            team: s.teamName,
            status: s.status,
            rarity: s.rarity,
            duplicates: s.duplicates,
            typeBreakdown: s.typeBreakdown,
            addedAt: s.addedAt,
          })),
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `album-copa-2026-${auth.user.email}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast?.("Download iniciado ✓", "success");
    setExporting(false);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "18px 20px",
      marginBottom: 12,
    }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
          📦 Exportar meus dados
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
          Baixe um arquivo com toda a sua coleção e dados da conta.
          Direito garantido pela LGPD (Lei 13.709/2018).
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        style={{
          width: "100%",
          padding: "12px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: exporting ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          transition: "all .2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {exporting ? "Exportando..." : "⬇️ Baixar meus dados (.json)"}
      </button>
    </div>
  );
}
