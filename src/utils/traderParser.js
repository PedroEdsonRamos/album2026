/**
 * Parser da lista de figurinhas colada pelo trocador.
 *
 * Extraído do tradeMatcher.js para manter cada arquivo coeso e abaixo de 300
 * linhas. Cuida dos formatos de colagem (lista simples, compacto, detalhado)
 * e dos aliases de siglas entre apps (HOL→NED, ALE→GER, etc.).
 */

/**
 * Mapa de siglas alternativas (de outros apps) → sigla oficial do nosso app.
 * Outros apps usam abreviações diferentes para os mesmos times.
 */
const TEAM_ALIASES = {
  // Holanda
  "HOL": "NED", "NED": "NED", "NLD": "NED",
  // Alemanha
  "ALE": "GER", "GER": "GER", "DEU": "GER",
  // Estados Unidos
  "EUA": "USA", "USA": "USA",
  // Curaçao
  "CUR": "CUW", "CUW": "CUW",
  // Congo RD
  "COG": "COD", "COD": "COD", "RDC": "COD", "DRC": "COD",
  // Arábia Saudita
  "ARA": "KSA", "KSA": "KSA", "SAU": "KSA",
  // África do Sul
  "AFS": "RSA", "ZAF": "RSA", "RSA": "RSA",
  // Coreia do Sul
  "CRS": "KOR", "KOR": "KOR", "COR": "KOR",
  // Argélia (cuidado: não confundir com Argentina=ARG)
  "ALG": "ALG", "ARGELIA": "ALG", "DZA": "ALG",
  // Argentina
  "ARG": "ARG",
  // Inglaterra
  "ING": "ENG", "ENG": "ENG",
  // Escócia
  "ESC": "SCO", "SCO": "SCO",
  // Croácia
  "CRO": "CRO", "CRA": "CRO",
  // Suíça
  "SUI": "SUI", "SWI": "SUI", "CHE": "SUI",
  // Japão
  "JAP": "JPN", "JPN": "JPN",
  // Espanha
  "ESP": "ESP", "SPA": "ESP",
  // demais batem com a sigla oficial (resolvidos pelo fallback)
};

/**
 * Resolve uma sigla de time (de qualquer app) para a sigla oficial.
 * Se não houver alias, retorna a própria sigla em UPPERCASE.
 */
function resolveTeamAlias(sigla) {
  const up = (sigla ?? "").toUpperCase().trim();
  return TEAM_ALIASES[up] ?? up;
}

/**
 * Extrai códigos válidos de um texto colado, suportando múltiplos formatos:
 *  - Lista simples: "BRA10, ARG05"
 *  - Compacto: "MEX 🇲🇽: 2 (×2), 3, 7"
 *  - Detalhado: "MEX18 — Alexis Vega | Atacante"
 *
 * @param {string} raw — texto colado
 * @param {Set<string>} validCodes — códigos existentes no álbum (UPPERCASE)
 * @returns {{ valid: string[], invalid: string[] }}
 */
export function parseTraderCodes(raw, validCodes) {
  if (!raw || !raw.trim()) return { valid: [], invalid: [] };

  const foundCodes = new Set();
  const invalidSet = new Set(); // candidatos SIGLA+NUM que não casaram em validCodes

  // Processa linha a linha (formatos compacto e detalhado são por linha)
  const lines = raw.split(/\r?\n/);

  for (let line of lines) {
    // Remove emojis e símbolos de bandeira (mantém letras, números, pontuação básica)
    const clean = line
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, " ")   // emojis
      .replace(/[\u{2600}-\u{27BF}]/gu, " ")     // símbolos diversos
      .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, " ")   // bandeiras
      .replace(/[\u{E0000}-\u{E007F}]/gu, " ")   // tags (bandeiras regionais)
      .replace(/[*_>#]/g, " ")                    // markdown
      .trim();

    if (!clean) continue;

    // Ignora linhas de ruído conhecido
    const lower = clean.toLowerCase();
    if (
      lower.includes("baixe o app") ||
      lower.includes("http") ||
      lower.includes("figurinhas disponíveis") ||
      lower.includes("figurinhas para troca") ||
      lower.startsWith("tipo:") ||
      lower.includes("ptec solutions")
    ) continue;

    // ===== Tentativa A: códigos completos na linha (ex "MEX18", "FWC10", "CC5", "ES7", "00") =====
    // Captura SIGLA+NÚMERO ou FWC/CC/ES+número ou "00"
    const fullCodeRegex = /\b([A-Z]{2,4})\s?(\d{1,3})\b|\b(00)\b/gi;
    let mFull;
    let foundInLine = false;
    while ((mFull = fullCodeRegex.exec(clean)) !== null) {
      if (mFull[3] === "00") {
        if (validCodes.has("00")) { foundCodes.add("00"); foundInLine = true; }
        continue;
      }
      const sigla = resolveTeamAlias(mFull[1]);
      const num = mFull[2];
      const code = `${sigla}${num}`;
      if (validCodes.has(code)) {
        foundCodes.add(code);
        foundInLine = true;
      } else {
        invalidSet.add(`${mFull[1]}${num}`);
      }
    }

    // Se já achou códigos completos na linha, vai para a próxima
    if (foundInLine) continue;

    // ===== Tentativa B: formato compacto "SIGLA: 2 (×2), 3, 7" =====
    const compactMatch = clean.match(/^([A-Za-z]{2,4})\s*[:：]\s*(.+)$/);
    if (compactMatch) {
      const sigla = resolveTeamAlias(compactMatch[1]);
      const numberspart = compactMatch[2];

      // Extrai todos os números (ignora "(×N)" que indica quantidade)
      const numRegex = /(\d{1,3})(?:\s*[（(]\s*[×x]\s*\d+\s*[）)])?/g;
      let mNum;
      while ((mNum = numRegex.exec(numberspart)) !== null) {
        const num = mNum[1];
        const code = `${sigla}${num}`;
        if (validCodes.has(code)) foundCodes.add(code);
      }
    }
  }

  // Separa válidos de inválidos (inválidos = não conseguimos resolver).
  // Coletados na mesma passada do loop (sem varrer o texto de novo).
  const valid = [...foundCodes];

  // Remove dos inválidos os que acabaram resolvidos por outro formato (ex: compacto).
  const invalid = [...invalidSet].filter(c => {
    const num = c.match(/\d+$/)?.[0] ?? "";
    const sigla = resolveTeamAlias(c.replace(/\d+$/, ""));
    return !foundCodes.has(`${sigla}${num}`);
  });

  return { valid, invalid };
}
