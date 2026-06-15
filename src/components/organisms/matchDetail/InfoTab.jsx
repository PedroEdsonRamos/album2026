import { SectionLabel } from "@/components/organisms/matchDetail/_shared";

/* Local da partida (estádio/cidade) */
export function InfoTab({ match }) {
  const venue = match.venue ?? match.fixture?.venue ?? {};
  return (
    <div>
      <SectionLabel>Local da partida</SectionLabel>
      <InfoRow label="Estádio" value={venue.name ?? "—"} />
      <InfoRow label="Cidade" value={venue.city ?? "—"} />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
