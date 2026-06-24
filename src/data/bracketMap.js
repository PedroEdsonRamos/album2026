/**
 * Estrutura fixa do mata-mata da Copa 2026 (jogos 73–104).
 * Pontas: { slot: "1A" | "2B" | "3-ABCDF" } no R32; { win: N } / { lose: N } adiante.
 * Fonte: regulamento FIFA / bracket oficial.
 */
export const BRACKET_ROUNDS = [
  {
    id: "r32",
    label: "Round of 32",
    matches: [
      { n: 73, home: { slot: "2A" }, away: { slot: "2B" } },
      { n: 74, home: { slot: "1E" }, away: { slot: "3-ABCDF" } },
      { n: 75, home: { slot: "1F" }, away: { slot: "2C" } },
      { n: 76, home: { slot: "1C" }, away: { slot: "2F" } },
      { n: 77, home: { slot: "1I" }, away: { slot: "3-CDFGH" } },
      { n: 78, home: { slot: "2E" }, away: { slot: "2I" } },
      { n: 79, home: { slot: "1A" }, away: { slot: "3-CEFHI" } },
      { n: 80, home: { slot: "1L" }, away: { slot: "3-EHIJK" } },
      { n: 81, home: { slot: "1D" }, away: { slot: "3-BEFIJ" } },
      { n: 82, home: { slot: "1G" }, away: { slot: "3-AEHIJ" } },
      { n: 83, home: { slot: "2K" }, away: { slot: "2L" } },
      { n: 84, home: { slot: "1H" }, away: { slot: "2J" } },
      { n: 85, home: { slot: "1B" }, away: { slot: "3-EFGIJ" } },
      { n: 86, home: { slot: "1J" }, away: { slot: "2H" } },
      { n: 87, home: { slot: "1K" }, away: { slot: "3-DEIJL" } },
      { n: 88, home: { slot: "2D" }, away: { slot: "2G" } },
    ],
  },
  {
    id: "r16",
    label: "Oitavas",
    matches: [
      { n: 89, home: { win: 74 }, away: { win: 77 } },
      { n: 90, home: { win: 73 }, away: { win: 75 } },
      { n: 91, home: { win: 76 }, away: { win: 78 } },
      { n: 92, home: { win: 79 }, away: { win: 80 } },
      { n: 93, home: { win: 83 }, away: { win: 84 } },
      { n: 94, home: { win: 81 }, away: { win: 82 } },
      { n: 95, home: { win: 86 }, away: { win: 88 } },
      { n: 96, home: { win: 85 }, away: { win: 87 } },
    ],
  },
  {
    id: "qf",
    label: "Quartas",
    matches: [
      { n: 97, home: { win: 89 }, away: { win: 90 } },
      { n: 98, home: { win: 93 }, away: { win: 94 } },
      { n: 99, home: { win: 91 }, away: { win: 92 } },
      { n: 100, home: { win: 95 }, away: { win: 96 } },
    ],
  },
  {
    id: "sf",
    label: "Semis",
    matches: [
      { n: 101, home: { win: 97 }, away: { win: 98 } },
      { n: 102, home: { win: 99 }, away: { win: 100 } },
    ],
  },
  {
    id: "final",
    label: "Final",
    matches: [
      { n: 104, home: { win: 101 }, away: { win: 102 } },
    ],
  },
  {
    id: "third",
    label: "3º lugar",
    matches: [
      { n: 103, home: { lose: 101 }, away: { lose: 102 } },
    ],
  },
];

/** Rótulo curto de uma ponta quando ela ainda não tem time definido. */
export function slotLabel(side) {
  if (!side) return "?";
  if (side.win) return `Vencedor ${side.win}`;
  if (side.lose) return `Perdedor ${side.lose}`;
  const s = side.slot || "";
  if (s.startsWith("1")) return `1º ${s.slice(1)}`;
  if (s.startsWith("2")) return `2º ${s.slice(1)}`;
  if (s.startsWith("3-")) return `3º (${s.slice(2).split("").join("/")})`;
  return s;
}
