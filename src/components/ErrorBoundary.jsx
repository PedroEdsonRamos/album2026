import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Erro capturado:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: "#0c0c1a",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "24px", fontFamily: "'Sora', sans-serif",
          gap: 16, textAlign: "center",
        }}>
          <img src="/trophy_title.png" style={{ height: 64, opacity: 0.4 }}
            onError={e => { e.target.style.display = "none"; }} />
          <div style={{ fontSize: 36, marginBottom: 4 }}>⚠️</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
            Algo deu errado
          </div>
          <div style={{
            fontSize: 13, color: "rgba(255,255,255,0.4)",
            lineHeight: 1.7, maxWidth: 300,
          }}>
            O aplicativo encontrou um erro inesperado.
            Seus dados estão seguros.
          </div>
          <button
            onClick={this.handleReload}
            style={{
              marginTop: 8, padding: "13px 32px",
              background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
              border: "none", borderRadius: 12,
              color: "#000", fontSize: 14, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
            }}>
            🔄 Recarregar app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
