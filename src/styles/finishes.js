export const FINISH = {
  Regular: {
    label: "Regular",
    color: "#1fc8d1",
    dimColor: "rgba(31,200,209,0.55)",
    bg: "rgba(20,160,170,0.14)",
    border: "rgba(31,200,209,0.38)",
    glow: "rgba(31,200,209,0.22)",
  },
  Lilás: {
    label: "Lilás",
    color: "#6d48a8",
    dimColor: "rgba(109,72,168,0.55)",
    bg: "rgba(90,55,145,0.18)",
    border: "rgba(109,72,168,0.42)",
    glow: "rgba(109,72,168,0.26)",
  },
  Bronze: {
    label: "Bronze",
    color: "#b8621b",
    dimColor: "rgba(184,98,27,0.55)",
    bg: "rgba(150,75,15,0.18)",
    border: "rgba(184,98,27,0.42)",
    glow: "rgba(184,98,27,0.26)",
  },
  Prata: {
    label: "Prata",
    color: "#cbd5e1",
    dimColor: "rgba(203,213,225,0.55)",
    bg: "rgba(180,195,215,0.15)",
    border: "rgba(203,213,225,0.42)",
    glow: "rgba(203,213,225,0.24)",
  },
  Ouro: {
    label: "Ouro",
    color: "#fbbf24",
    dimColor: "rgba(251,191,36,0.55)",
    bg: "rgba(200,140,10,0.18)",
    border: "rgba(251,191,36,0.45)",
    glow: "rgba(251,191,36,0.3)",
  },
  "Coca-Cola": {
    label: "Coca-Cola",
    color: "#f40009",
    dimColor: "rgba(244,0,9,0.55)",
    bg: "rgba(180,0,10,0.16)",
    border: "rgba(244,0,9,0.4)",
    glow: "rgba(244,0,9,0.28)",
  },
};

export function rarToFinish(r) {
  if (r === "Prata" || r === "Brilhante") return "Prata";
  if (r === "Bronze") return "Bronze";
  if (r === "Lilás" || r === "Lilas") return "Lilás";
  if (r === "Gold" || r === "Ouro" || r === "Legend" || r === "Ultra Rara" || r === "Extra")
    return "Ouro";
  if (r === "Coca-Cola") return "Coca-Cola";
  return "Regular";
}

export function getFinish(r) {
  return FINISH[rarToFinish(r)] || FINISH.Regular;
}
