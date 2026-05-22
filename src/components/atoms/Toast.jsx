import { useEffect } from "react";
import { C } from "@/styles/tokens.js";

export function Toast({ msg, type, duration, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, duration || 2400);
    return () => clearTimeout(t);
  }, []);

  const col = type === "error" ? C.red : type === "info" ? C.cyan : C.green;
  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(16,16,28,0.97)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${col}44`,
        borderRadius: 14,
        padding: "12px 20px",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        zIndex: 9999,
        whiteSpace: "nowrap",
        boxShadow: `0 8px 32px ${col}33`,
        animation: "toastIn 0.3s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      <span style={{ color: col, marginRight: 8, fontWeight: 900 }}>
        {type === "error" ? "✕" : type === "info" ? "›" : "✓"}
      </span>
      {msg}
    </div>
  );
}
