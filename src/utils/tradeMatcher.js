/**
 * Lógica do Trocador Inteligente.
 *
 * Recebe a coleção completa do usuário e a lista de códigos repetidos do
 * trocador, e devolve uma sugestão de troca equilibrada por tipo.
 */

// Parser foi movido para módulo próprio; re-exportado aqui para manter os imports existentes.
export { parseTraderCodes } from "./traderParser.js";

/* ===== Classificação de tipo ===== */

/**
 * Classifica uma figurinha em um "tipo" para fins de troca.
 * Tipos: "extra" | "cocacola" | "fwc" | "escudo" | "fotoEquipe" | "especial" | "jogador"
 *
 * @param {Object} s — figurinha
 * @param {Object} esByCode — mapa ES_BY_CODE (extra stickers por código)
 */
export function getStickerType(s, esByCode = {}) {
  if (!s) return "jogador";
  if (s.code && esByCode[s.code]) return "extra";
  if (s.team === "CC") return "cocacola";
  if (s.team === "FWC" || s.code === "00") return "fwc";
  if (s.position === "Escudo") return "escudo";
  if (s.position === "Foto Equipe") return "fotoEquipe";
  if (s.position === "Especial") return "especial";
  return "jogador";
}

const TYPE_LABELS = {
  extra: "Extra Sticker",
  cocacola: "Coca-Cola",
  fwc: "Mascotes e Emblemas",
  escudo: "Escudo",
  fotoEquipe: "Foto de Equipe",
  especial: "Especial",
  jogador: "Jogador",
};

export function getTypeLabel(type) {
  return TYPE_LABELS[type] ?? type;
}

/* ===== Matching ===== */

/**
 * Pareamento equilibrado por tipo — compartilhado pelos dois modos de troca.
 * Passada 1: match perfeito (mesmo tipo + mesma seleção/time).
 * Passada 2: fallback (só mesmo tipo).
 */
function pairBuckets(receiveBucket, offerBucket, esByCode = {}) {
  const usedOffer = new Set();
  const matched = new Set();
  const suggestedPairs = [];

  const typeOf = new Map();
  [...receiveBucket, ...offerBucket].forEach((s) => {
    if (!typeOf.has(s.id)) typeOf.set(s.id, getStickerType(s, esByCode));
  });

  // Passada 1 — perfeitos
  receiveBucket.forEach((receive) => {
    const rType = typeOf.get(receive.id);
    const give = offerBucket.find(
      (o) => !usedOffer.has(o.id) && typeOf.get(o.id) === rType && o.team === receive.team
    );
    if (give) {
      usedOffer.add(give.id);
      matched.add(receive.id);
      suggestedPairs.push({ give, receive, perfect: true });
    }
  });

  // Passada 2 — fallback (só mesmo tipo)
  receiveBucket.forEach((receive) => {
    if (matched.has(receive.id)) return;
    const rType = typeOf.get(receive.id);
    const give = offerBucket.find((o) => !usedOffer.has(o.id) && typeOf.get(o.id) === rType);
    if (give) {
      usedOffer.add(give.id);
      matched.add(receive.id);
      suggestedPairs.push({ give, receive, perfect: false });
    }
  });

  suggestedPairs.sort((a, b) => (a.perfect !== b.perfect ? (a.perfect ? -1 : 1) : 0));

  const receiveWithoutPair = receiveBucket.filter((r) => !matched.has(r.id));
  const offerWithoutPair = offerBucket.filter((o) => !usedOffer.has(o.id));

  return {
    suggestedPairs,
    receiveWithoutPair,
    offerWithoutPair,
    summary: { willReceive: suggestedPairs.length, willGive: suggestedPairs.length },
  };
}

/**
 * Calcula a sugestão de troca.
 *
 * @param {Object} params
 * @param {Array}  params.allStickers — coleção completa do usuário (com status/duplicates)
 * @param {string[]} params.traderCodes — códigos das repetidas do trocador (válidos, UPPERCASE)
 * @param {Object} params.esByCode — mapa ES_BY_CODE
 * @returns {{
 *   suggestedPairs: Array<{ give: Object, receive: Object, perfect: boolean }>,
 *   receiveWithoutPair: Array<Object>,
 *   allMyDuplicates: Array<Object>,
 *   summary: { willReceive: number, willGive: number }
 * }}
 */
export function computeTrade({ allStickers, traderCodes, esByCode = {} }) {
  if (!Array.isArray(allStickers) || allStickers.length === 0) {
    return { suggestedPairs: [], receiveWithoutPair: [], allMyDuplicates: [], summary: { willReceive: 0, willGive: 0 } };
  }

  const traderSet = new Set(traderCodes ?? []);

  // Mapa code → sticker (para resolver os códigos do trocador)
  const byCode = {};
  allStickers.forEach(s => { if (s?.code) byCode[s.code] = s; });

  // ===== Balde A — "Eu recebo": repetidas do trocador que EU não tenho =====
  const receiveBucket = (traderCodes ?? [])
    .map(code => byCode[code])
    .filter(s => s && s.status === "Faltando");

  // ===== Balde B — "Eu ofereço": minhas repetidas que o trocador NÃO colou =====
  const offerBucket = allStickers.filter(
    s => s && s.status === "Repetida" && !traderSet.has(s.code)
  );

  const { suggestedPairs, receiveWithoutPair } = pairBuckets(receiveBucket, offerBucket, esByCode);
  const allMyDuplicates = offerBucket;

  return {
    suggestedPairs,
    receiveWithoutPair,
    allMyDuplicates,
    summary: {
      willReceive: suggestedPairs.length,
      willGive: suggestedPairs.length,
    },
  };
}

/**
 * Troca por LINK — match dos dois lados (preciso, sem chute).
 * Usa o estado decodificado do trocador (decodeTradeLink): conjuntos de códigos.
 *
 *   eu recebo = repetidas DELE  ∩  minhas FALTANDO
 *   eu dou    = minhas REPETIDAS ∩  faltantes DELE
 *
 * @param {Object} params
 * @param {Array}  params.allStickers       — minha coleção completa
 * @param {Set<string>} params.theirRepetidas — códigos repetidos do trocador
 * @param {Set<string>} params.theirFaltantes — códigos que o trocador precisa
 * @param {Object} params.esByCode          — mapa ES_BY_CODE
 * @returns {{ suggestedPairs, receiveWithoutPair, offerWithoutPair, summary }}
 */
export function computeLinkTrade({ allStickers, theirRepetidas, theirFaltantes, esByCode = {} }) {
  const empty = {
    suggestedPairs: [], receiveWithoutPair: [], offerWithoutPair: [],
    summary: { willReceive: 0, willGive: 0 },
  };
  if (!Array.isArray(allStickers) || allStickers.length === 0) return empty;

  const theirRep = theirRepetidas instanceof Set ? theirRepetidas : new Set(theirRepetidas ?? []);
  const theirFal = theirFaltantes instanceof Set ? theirFaltantes : new Set(theirFaltantes ?? []);

  // Eu recebo: o que ELE tem repetido e EU não tenho
  const receiveBucket = allStickers.filter((s) => s && s.status === "Faltando" && theirRep.has(s.code));
  // Eu dou: o que EU tenho repetido e ELE precisa
  const offerBucket = allStickers.filter((s) => s && s.status === "Repetida" && theirFal.has(s.code));

  return pairBuckets(receiveBucket, offerBucket, esByCode);
}

/* ===== Resumo em texto (para copiar/compartilhar) ===== */

/**
 * Gera um texto-resumo da troca para o usuário enviar ao trocador.
 */
export function buildTradeSummaryText(suggestedPairs, receiveWithoutPair = []) {
  if (!suggestedPairs.length && !receiveWithoutPair.length) return "";

  const lines = ["🔄 *Proposta de troca*", ""];

  if (suggestedPairs.length) {
    lines.push(`*Entrego* (${suggestedPairs.length}):`);
    suggestedPairs.forEach(p => lines.push(`  • ${p.give.code} — ${p.give.name}`));
    lines.push("");
    lines.push(`*Recebo* (${suggestedPairs.length}):`);
    suggestedPairs.forEach(p => lines.push(`  • ${p.receive.code} — ${p.receive.name}`));
  }

  if (receiveWithoutPair.length) {
    lines.push("");
    lines.push(`*Ainda preciso* (a combinar):`);
    receiveWithoutPair.forEach(s => lines.push(`  • ${s.code} — ${s.name}`));
  }

  lines.push("");
  lines.push("📲 Álbum FIFA World Cup 2026 · PTEC Solutions");

  return lines.join("\n");
}
