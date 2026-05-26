export const FINISH = {
  Comum:       { label: "Comum",      color: "#1fc8d1", dimColor: "rgba(31,200,209,0.55)",  bg: "rgba(15,160,170,0.14)",  border: "rgba(31,200,209,0.4)",  glow: "rgba(31,200,209,0.28)"  },
  "Lilás":     { label: "Lilás",      color: "#a855f7", dimColor: "rgba(168,85,247,0.55)",  bg: "rgba(109,72,168,0.16)",  border: "rgba(168,85,247,0.4)",  glow: "rgba(168,85,247,0.28)"  },
  Bronze:      { label: "Bronze",     color: "#d97706", dimColor: "rgba(184,98,27,0.55)",   bg: "rgba(184,98,27,0.16)",   border: "rgba(184,98,27,0.4)",   glow: "rgba(184,98,27,0.28)"   },
  Prata:       { label: "Prata",      color: "#cbd5e1", dimColor: "rgba(203,213,225,0.55)", bg: "rgba(148,163,184,0.14)", border: "rgba(203,213,225,0.4)", glow: "rgba(203,213,225,0.28)" },
  Ouro:        { label: "Ouro",       color: "#fbbf24", dimColor: "rgba(251,191,36,0.55)",  bg: "rgba(251,191,36,0.14)",  border: "rgba(251,191,36,0.4)",  glow: "rgba(251,191,36,0.28)"  },
  Metalizado:  { label: "Metalizada", color: "#94a3b8", dimColor: "rgba(148,163,184,0.55)", bg: "rgba(100,116,139,0.14)", border: "rgba(148,163,184,0.4)", glow: "rgba(148,163,184,0.18)" },
  "Coca-Cola": { label: "Coca-Cola",  color: "#f40009", dimColor: "rgba(244,0,9,0.55)",     bg: "rgba(180,0,10,0.16)",   border: "rgba(244,0,9,0.4)",    glow: "rgba(244,0,9,0.28)"     },
};

export function rarToFinish(r) {
  if (r === "Comum")                                                              return "Comum";
  if (r === "Normal")                                                             return "Comum"; // backward compat
  if (r === "Lilás" || r === "Lilas")                                            return "Lilás";
  if (r === "Bronze")                                                             return "Bronze";
  if (r === "Prata" || r === "Brilhante")                                        return "Prata";
  if (r === "Ouro" || r === "Gold" || r === "Legend" || r === "Ultra Rara" || r === "Extra") return "Ouro";
  if (r === "Metalizado")                                                         return "Metalizado";
  if (r === "Coca-Cola")                                                          return "Coca-Cola";
  return "Comum";
}

export function getFinish(r) {
  return FINISH[rarToFinish(r)] || FINISH.Comum;
}
