export function AuthCallbackScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0c1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Sora', sans-serif",
      gap: 20,
    }}>
      <img
        src="/trophy_title.png"
        alt="Troféu"
        style={{ height: 72, opacity: 0.6, objectFit: "contain" }}
        onError={e => { e.target.style.display = "none"; }}
      />
      <div style={{
        width: 32, height: 32,
        border: "3px solid rgba(245,158,11,0.2)",
        borderTopColor: "#f59e0b",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        Confirmando seu email...
      </div>
    </div>
  );
}
