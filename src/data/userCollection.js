const MY_RAW = ``;

function normalizeCode(tok) {
  if (tok === "00") return "00";
  if (tok === "FWC00") return "FWC00";
  const m = tok.match(/^([A-Z]{2,4})\s*(\d+)$/);
  if (m) return `${m[1]}${m[2]}`; // sem espaço: "BRA10", "FWC10"
  return tok;
}

export function parseMyCodes(raw) {
  const tokens = raw
    .replace(/\n/g, ",")
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
  const countMap = {};
  tokens.forEach((tok) => {
    const key = normalizeCode(tok);
    countMap[key] = (countMap[key] || 0) + 1;
  });
  return countMap;
}

export const MY_COUNT = parseMyCodes(MY_RAW);
export const MY_CODES = new Set(Object.keys(MY_COUNT));
