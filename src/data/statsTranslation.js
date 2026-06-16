export const STAT_CONFIG = {
  "Possession":        { label: "Posse de bola", type: "percent", priority: 1 },
  "Total passes":      { label: "Total de passes", type: "int", priority: 2 },
  "Successful passes": { label: "Passes certos", type: "int", priority: 3 },
  "Shots on target":   { label: "Finalizações no gol", type: "int", priority: 4 },
  "Shots off target":  { label: "Finalizações para fora", type: "int", priority: 5 },
  "Blocked shots":     { label: "Finalizações bloqueadas", type: "int", priority: 6 },
  "Corners":           { label: "Escanteios", type: "int", priority: 7 },
  "Offsides":          { label: "Impedimentos", type: "int", priority: 8 },
  "Fouls":             { label: "Faltas", type: "int", priority: 9 },
  "Yellow cards":      { label: "Cartões amarelos", type: "int", priority: 10 },
  "Red cards":         { label: "Cartões vermelhos", type: "int", priority: 11 },
  "Goalkeeper saves":  { label: "Defesas do goleiro", type: "int", priority: 12 },
  "Expected Goals":    { label: "Gols esperados (xG)", type: "decimal", priority: 13 },
  "Attacks":           { label: "Ataques", type: "int", priority: 14 },
  "Successful Dribbles": { label: "Dribles certos", type: "int", priority: 15 },
  "Interceptions":     { label: "Interceptações", type: "int", priority: 16 },
  "Clearances":        { label: "Cortes", type: "int", priority: 17 },
  "Key Passes":        { label: "Passes decisivos", type: "int", priority: 18 },
};

export function getDisplayStats(homeStats, awayStats) {
  const result = [];
  Object.entries(STAT_CONFIG)
    .sort((a, b) => a[1].priority - b[1].priority)
    .forEach(([displayName, config]) => {
      const home = homeStats.find(s => s.displayName === displayName)?.value;
      const away = awayStats.find(s => s.displayName === displayName)?.value;
      if (home !== undefined || away !== undefined) {
        result.push({ label: config.label, type: config.type, home: home ?? 0, away: away ?? 0 });
      }
    });
  return result;
}
