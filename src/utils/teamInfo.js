import { ALL_TEAMS } from "@/data/teams.js";

export function teamInfo(id) {
  const t = ALL_TEAMS.find((x) => x.id === id);
  if (t) return t;
  if (id === "FWC") return { id: "FWC", name: "FIFA World Cup", flag: "🏆", color: "#f59e0b" };
  return { id, name: id, flag: "🏳", color: "#f59e0b" };
}
