/* Helpers compartilhados entre as tabs do MatchDetailModal */

export function LoadingTab({ message = "Carregando..." }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 20px",
      gap: 12,
      color: "rgba(255,255,255,0.5)",
      fontSize: 13,
    }}>
      <div style={{
        width: 28, height: 28,
        border: "3px solid rgba(245,158,11,0.2)",
        borderTopColor: "#f59e0b",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}/>
      {message}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function EmptyTab({ message }) {
  return (
    <div style={{
      padding: "60px 20px",
      textAlign: "center",
      color: "rgba(255,255,255,0.4)",
      fontSize: 13,
    }}>{message}</div>
  );
}

export function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.15em",
      color: "rgba(255,255,255,0.35)",
      textTransform: "uppercase",
      marginBottom: 8,
      paddingLeft: 2,
      ...style,
    }}>{children}</div>
  );
}
