export const toRgba = (hex, alpha) => {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export function CardGlow({ color, showLine = false }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: -1,
          right: -1,
          width: 90,
          height: 90,
          background: `radial-gradient(circle at top right, ${toRgba(color, 0.52)} 0%, ${toRgba(color, 0.16)} 45%, transparent 70%)`,
          borderRadius: "0 14px 0 0",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {showLine && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 14,
            right: 14,
            height: 1.5,
            background: `linear-gradient(90deg, transparent 0%, ${toRgba(color, 0.78)} 28%, ${toRgba(color, 0.78)} 72%, transparent 100%)`,
            borderRadius: 999,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
    </>
  );
}
