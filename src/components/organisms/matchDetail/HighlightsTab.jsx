/* Vídeos de melhores momentos */
export function HighlightsTab({ highlights }) {
  if (!highlights?.length) return null;

  return (
    <div>
      {highlights.map((h, idx) => (
        <HighlightCard key={idx} highlight={h} />
      ))}
    </div>
  );
}

function HighlightCard({ highlight }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      {/* Thumbnail clicável */}
      {highlight.imgUrl && (
        <a href={highlight.url} target="_blank" rel="noopener noreferrer" style={{
          display: "block", position: "relative",
        }}>
          <img
            src={highlight.imgUrl}
            alt={highlight.title}
            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: "rgba(245,158,11,0.95)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}>
              <span style={{
                color: "#0c0c1a", fontSize: 20, marginLeft: 4,
              }}>▶</span>
            </div>
          </div>
        </a>
      )}
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>
          {highlight.title ?? "Highlight"}
        </div>
      </div>
    </div>
  );
}
