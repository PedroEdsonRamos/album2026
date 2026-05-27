export function AuthButton({
  children,
  onClick,
  loading,
  disabled,
  variant = "primary",
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: 12,
        border: isPrimary ? "none" : "1px solid rgba(255,255,255,0.15)",
        background: isPrimary
          ? loading || disabled
            ? "rgba(245,158,11,0.4)"
            : "linear-gradient(135deg, #f59e0b, #fbbf24)"
          : "rgba(255,255,255,0.06)",
        color: isPrimary ? "#000" : "#fff",
        fontSize: 14,
        fontWeight: isPrimary ? 800 : 600,
        cursor: loading || disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "all .2s",
        marginBottom: 10,
      }}
    >
      {loading ? (
        <>
          <span
            style={{
              width: 16,
              height: 16,
              border: "2px solid rgba(0,0,0,0.3)",
              borderTopColor: "#000",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              display: "inline-block",
            }}
          />
          Aguarde...
        </>
      ) : (
        children
      )}
    </button>
  );
}
