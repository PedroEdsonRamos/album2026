export function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  disabled,
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 6,
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${error ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 12,
          padding: "13px 16px",
          fontSize: 14,
          color: "#fff",
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color .2s, box-shadow .2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error
            ? "rgba(248,113,113,0.8)"
            : "rgba(245,158,11,0.5)";
          e.target.style.boxShadow = error
            ? "none"
            : "0 0 0 3px rgba(245,158,11,0.08)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? "rgba(248,113,113,0.6)"
            : "rgba(255,255,255,0.1)";
          e.target.style.boxShadow = "none";
        }}
      />
      {error && (
        <div
          style={{
            fontSize: 11,
            color: "#f87171",
            marginTop: 5,
            paddingLeft: 4,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
