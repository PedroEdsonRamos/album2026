/**
 * Lógica do Trocador Inteligente.
 *
 * Recebe a coleção completa do usuário e a lista de códigos repetidos do
 * trocador, e devolve uma sugestão de troca equilibrada por tipo.
 */

/* ===== Classificação de tipo ===== */

/**
 * Classifica uma figurinha em um "tipo" para fins de troca.
 * Tipos: "extra" | "cocacola" | "fwc" | "escudo" | "fotoEquipe" | "especial" | "jogador"
 *
 * @param {Object} s — figurinha
 * @param {Object} esByCode — mapa ES_BY_CODE (extra stickers por código)
 */
export function getStickerType(s, esByCode = {}) {
  if (esByCode[s.code]) return "extra";
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

/* ===== Parsing da lista colada ===== */

/**
 * Extrai códigos válidos de um texto colado pelo usuário.
 * Aceita separação por vírgula, espaço, quebra de linha, ponto-e-vírgula.
 *
 * @param {string} raw — texto colado
 * @param {Set<string>} validCodes — conjunto de códigos existentes no álbum (UPPERCASE)
 * @returns {{ valid: string[], invalid: string[] }}
 */
export function parseTraderCodes(raw, validCodes) {
  if (!raw || !raw.trim()) return { valid: [], invalid: [] };

  const tokens = raw
    .toUpperCase()
    .split(/[\s,;]+/)
    .map(t => t.trim())
    .filter(Boolean);

  const valid = [];
  const invalid = [];
  const seen = new Set();

  tokens.forEach(code => {
    if (seen.has(code)) return; // ignora duplicados na própria lista
    seen.add(code);
    if (validCodes.has(code)) valid.push(code);
    else invalid.push(code);
  });

  return { valid, invalid };
}

/* ===== Matching ===== */

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
  const traderSet = new Set(traderCodes);

  // Mapa code → sticker (para resolver os códigos do trocador)
  const byCode = {};
  allStickers.forEach(s => { byCode[s.code] = s; });

  // ===== Balde A — "Eu recebo": repetidas do trocador que EU não tenho =====
  const receiveBucket = traderCodes
    .map(code => byCode[code])
    .filter(s => s && s.status === "Faltando");

  // ===== Balde B — "Eu ofereço": minhas repetidas que o trocador NÃO colou =====
  const myDuplicates = allStickers.filter(s => s.status === "Repetida");
  const offerBucket = myDuplicates.filter(s => !traderSet.has(s.code));

  // ===== Matching equilibrado por tipo =====
  const usedOffer = new Set(); // ids já pareados
  const suggestedPairs = [];
  const receiveWithoutPair = [];

  receiveBucket.forEach(receive => {
    const rType = getStickerType(receive, esByCode);

    // 1. Match perfeito: mesmo tipo + mesma seleção
    let give = offerBucket.find(o =>
      !usedOffer.has(o.id) &&
      getStickerType(o, esByCode) === rType &&
      o.team === receive.team
    );
    let perfect = !!give;

    // 2. Fallback: mesmo tipo, qualquer seleção
    if (!give) {
      give = offerBucket.find(o =>
        !usedOffer.has(o.id) &&
        getStickerType(o, esByCode) === rType
      );
      perfect = false;
    }

    if (give) {
      usedOffer.add(give.id);
      suggestedPairs.push({ give, receive, perfect });
    } else {
      receiveWithoutPair.push(receive);
    }
  });

  // Todas as minhas repetidas que o trocador não tem (para escolha manual)
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

/* ===== Resumo em texto (para copiar/compartilhar) ===== */

/**
 * Gera um texto-resumo da troca para o usuário enviar ao trocador.
 */
export function buildTradeSummaryText(suggestedPairs) {
  if (!suggestedPairs.length) return "";

  const give = suggestedPairs.map(p => `${p.give.code} (${p.give.name})`).join(", ");
  const receive = suggestedPairs.map(p => `${p.receive.code} (${p.receive.name})`).join(", ");

  return [
    "🔄 Proposta de troca",
    "",
    `Eu te dou (${suggestedPairs.length}): ${give}`,
    "",
    `Você me dá (${suggestedPairs.length}): ${receive}`,
  ].join("\n");
}
