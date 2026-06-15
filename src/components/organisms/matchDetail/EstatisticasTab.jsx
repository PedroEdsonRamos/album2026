import { SectionLabel, hasValidStats } from "@/components/organisms/matchDetail/_shared";

/* Estatísticas comparativas da partida */
export function EstatisticasTab({ stats }) {
  if (!hasValidStats(stats)) return null;

  // A estrutura geralmente é [{ team, statistics: [...]}], dois itens
  const homeStats = stats[0]?.statistics ?? [];
  const awayStats = stats[1]?.statistics ?? [];

  // Combinar para exibir como linhas comparativas
  const statTypes = new Set([
    ...homeStats.map((s) => s.type),
    ...awayStats.map((s) => s.type),
  ]);

  return (
    <div>
      <SectionLabel>Estatísticas da partida</SectionLabel>
      {Array.from(statTypes).map((type) => {
        const home = homeStats.find((s) => s.type === type)?.value ?? "0";
        const away = awayStats.find((s) => s.type === type)?.value ?? "0";
        return <StatRow key={type} label={translateStat(type)} home={home} away={away} />;
      })}
    </div>
  );
}

function translateStat(type) {
  const map = {
    "Ball Possession": "Posse de bola",
    "Total Shots": "Finalizações",
    "Shots on Goal": "No gol",
    "Shots off Goal": "Para fora",
    "Blocked Shots": "Bloqueadas",
    "Corner Kicks": "Escanteios",
    "Offsides": "Impedimentos",
    "Fouls": "Faltas",
    "Yellow Cards": "Cartões amarelos",
    "Red Cards": "Cartões vermelhos",
    "Passes": "Passes",
    "Passes %": "Acerto de passes",
    "Goalkeeper Saves": "Defesas",
  };
  return map[type] ?? type;
}

function StatRow({ label, home, away }) {
  // Parse % se for porcentagem
  const homeNum = parseFloat(String(home).replace("%","")) || 0;
  const awayNum = parseFloat(String(away).replace("%","")) || 0;
  const total = homeNum + awayNum;
  const homePct = total > 0 ? (homeNum / total) * 100 : 50;

  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 12,
        alignItems: "center",
        marginBottom: 6,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", minWidth: 32 }}>{home}</span>
        <span style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
          letterSpacing: "0.03em",
        }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", minWidth: 32, textAlign: "right" }}>{away}</span>
      </div>
      {/* Barra visual */}
      <div style={{
        display: "flex",
        height: 4,
        borderRadius: 2,
        overflow: "hidden",
        background: "rgba(255,255,255,0.05)",
      }}>
        <div style={{
          width: `${homePct}%`,
          background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
        }}/>
        <div style={{
          width: `${100 - homePct}%`,
          background: "rgba(255,255,255,0.15)",
        }}/>
      </div>
    </div>
  );
}
