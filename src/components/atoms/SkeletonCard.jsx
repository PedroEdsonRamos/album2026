export function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "10px 12px",
      animation: "shimmer 1.5s infinite",
    }}>
      <div style={{
        height: 10, width: "60%",
        background: "rgba(255,255,255,0.07)",
        borderRadius: 6, marginBottom: 8,
      }} />
      <div style={{
        height: 8, width: "40%",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 6, marginBottom: 10,
      }} />
      <div style={{
        height: 20, width: "30%",
        background: "rgba(255,255,255,0.06)",
        borderRadius: 999,
      }} />
    </div>
  );
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
