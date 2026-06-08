import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App.jsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.jsx";

// Detecta recovery ANTES de qualquer coisa do React — impede o useAuth de logar o usuário
function detectRecoveryFromURL() {
  const hash = window.location.hash || "";
  const search = window.location.search || "";

  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(search);

  const type = hashParams.get("type") || searchParams.get("type");
  const hasToken =
    hash.includes("access_token") ||
    search.includes("token_hash") ||
    search.includes("code");

  return type === "recovery" && hasToken;
}

const isRecovery = detectRecoveryFromURL();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App initialRecovery={isRecovery} />
    </ErrorBoundary>
  </StrictMode>
);
