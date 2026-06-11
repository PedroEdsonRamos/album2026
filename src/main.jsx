import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./styles/globals.css";
import App from "./App.jsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.jsx";

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1,
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      "Network request failed",
      "Load failed",
    ],
    beforeSend(event, hint) {
      const error = hint.originalException;
      if (error?.stack?.includes("chrome-extension://")) return null;
      if (error?.stack?.includes("moz-extension://")) return null;
      return event;
    },
  });
}

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
