import { ALL_TEAMS } from "@/data/teams.js";

export function teamInfo(id) {
  const t = ALL_TEAMS.find((x) => x.id === id);
  if (t) return t;
  if (id === "FWC") return { id: "FWC", name: "FIFA World Cup", flag: "🏆", color: "#f59e0b" };
  if (id === "CC") return { id: "CC", name: "Coca-Cola", flag: "🥤", color: "#f40009" };
  if (id === "ES") return { id: "ES", name: "Extra Stickers", flag: "⭐", color: "#6d48a8" };
  return { id, name: id, flag: "🏳", color: "#f59e0b" };
}
