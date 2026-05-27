export function SyncIndicator({ status }) {
  if (status === "idle" || status === "synced") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          color: "rgba(255,255,255,0.25)",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4ade80",
          }}
        />
        Salvo
      </div>
    );
  }

  if (status === "syncing") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          color: "rgba(245,158,11,0.6)",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#f59e0b",
            animation: "pulse 1s infinite",
          }}
        />
        Salvando...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          color: "rgba(248,113,113,0.7)",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#f87171",
          }}
        />
        Erro ao salvar
      </div>
    );
  }

  return null;
}
