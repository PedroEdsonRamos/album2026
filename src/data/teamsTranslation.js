/**
 * Tradução de nomes de seleções da Highlightly para português brasileiro.
 * Chave = team.id da API
 */
export const TEAM_NAMES_PT = {
  // Grupo A
  14400:   "México",
  15251:   "Coreia do Sul",
  656054:  "República Tcheca",
  1303665: "África do Sul",

  // Grupo B
  13549:   "Suíça",
  4705963: "Canadá",
  1336003: "Catar",
  947947:  "Bósnia e Herzegovina",

  // Grupo C
  943692:  "Escócia",
  27165:   "Marrocos",
  5890:    "Brasil",
  2031270: "Haiti",

  // Grupo D
  2029568: "Estados Unidos",
  17804:   "Austrália",
  662011:  "Turquia",
  2026164: "Paraguai",

  // Grupo E
  22059:   "Alemanha",
  1278135: "Costa do Marfim",
  2027866: "Equador",
  4706814: "Curaçao",

  // Grupo F
  10996:   "Japão",
  952202:  "Holanda",
  5039:    "Suécia",
  24612:   "Tunísia",

  // Grupo G
  1635:    "Bélgica",
  28016:   "Egito",
  19506:   "Irã",
  3977507: "Nova Zelândia",

  // Grupo H
  8443:    "Espanha",
  1305367: "Cabo Verde",
  20357:   "Arábia Saudita",
  6741:    "Uruguai",

  // Grupo I
  2486:    "França",
  11847:   "Senegal",
  1334301: "Iraque",
  928374:  "Noruega",

  // Grupo J
  22910:   "Argentina",
  1304516: "Argélia",
  660309:  "Áustria",
  1318132: "Jordânia",

  // Grupo K
  23761:   "Portugal",
  1284092: "República Democrática do Congo",
  1335152: "Uzbequistão",
  7592:    "Colômbia",

  // Grupo L
  9294:    "Inglaterra",
  3337:    "Croácia",
  1280688: "Gana",
  10145:   "Panamá",
};

/**
 * Versão curta para usar em cards estreitos (ex: "Bósnia e Herzegovina" → "Bósnia").
 * Use apenas onde houver risco real de quebra de layout.
 */
export const TEAM_NAMES_PT_SHORT = {
  947947:  "Bósnia",
  1284092: "Rep. Dem. Congo",
  1305367: "Cabo Verde",
  1278135: "Costa do Marfim",
  // demais usam o nome completo
};

export function getTeamName(team, options = {}) {
  if (!team) return "—";
  const id = team.id;

  // Versão curta opcional
  if (options.short && TEAM_NAMES_PT_SHORT[id]) {
    return TEAM_NAMES_PT_SHORT[id];
  }

  // Versão completa em PT-BR
  if (TEAM_NAMES_PT[id]) {
    return TEAM_NAMES_PT[id];
  }

  // Fallback: nome original
  return team.name ?? "—";
}
