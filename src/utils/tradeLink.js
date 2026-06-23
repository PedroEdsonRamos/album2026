/**
 * Codec do link de troca — Caminho A (peer-to-peer, sem backend).
 *
 * Empacota o estado do usuário relevante pra troca (REPETIDAS = pode dar;
 * FALTANDO = precisa) num texto curto que cabe no WhatsApp/URL. O outro
 * usuário abre no app dele e cruza com o álbum dele → troca perfeita dos 2 lados.
 *
 * Empacotamento por POSIÇÃO na ordem canônica (a mesma de `stickers`, vinda de
 * buildDatabase()). O fingerprint da ordem detecta apps em versões diferentes.
 *
 * Header (6 bytes): version(1) | kind(1) | count(2) | fingerprint(2)
 *   - kind 0 = estado (repetidas + faltantes)  ← este arquivo
 *   - kind 1 = confirmação (pares acordados)    ← prompt futuro
 * Após o header: bitset repetidas + bitset faltantes (cada um ceil(count/8) bytes).
 */

const LINK_FORMAT_VERSION = 1;
const KIND_STATE = 0;
const KIND_CONFIRM = 1;

/* ===== Fingerprint da ordem canônica (FNV-1a 32-bit → 16 bits) ===== */
export function canonicalFingerprint(stickers) {
  let h = 0x811c9dc5;
  const str = stickers.map((s) => s.code).join(",");
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h & 0xffff;
}

/* ===== Bitset ===== */
function packBits(flags) {
  const bytes = new Uint8Array(Math.ceil(flags.length / 8));
  for (let i = 0; i < flags.length; i++) {
    if (flags[i]) bytes[i >> 3] |= 1 << (i & 7);
  }
  return bytes;
}
function readBit(bytes, i) {
  return (bytes[i >> 3] >> (i & 7)) & 1;
}

/* ===== base64url ===== */
function bytesToB64url(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ===== API ===== */

/** Gera o payload (base64url) com o estado do usuário pra troca. */
export function encodeTradeLink(stickers) {
  const n = stickers.length;
  const repBytes = packBits(stickers.map((s) => s.status === "Repetida"));
  const falBytes = packBits(stickers.map((s) => s.status === "Faltando"));
  const fp = canonicalFingerprint(stickers);

  const header = new Uint8Array(6);
  header[0] = LINK_FORMAT_VERSION;
  header[1] = KIND_STATE;
  header[2] = (n >> 8) & 0xff;
  header[3] = n & 0xff;
  header[4] = (fp >> 8) & 0xff;
  header[5] = fp & 0xff;

  const out = new Uint8Array(6 + repBytes.length + falBytes.length);
  out.set(header, 0);
  out.set(repBytes, 6);
  out.set(falBytes, 6 + repBytes.length);
  return bytesToB64url(out);
}

/**
 * Lê um payload contra a coleção DESTE usuário.
 * @returns {{ok:true, theirRepetidas:Set<string>, theirFaltantes:Set<string>}
 *          | {ok:false, reason:"invalid"|"version"}}
 *   reason "version" = ordem/versão incompatível → pedir pra atualizar o app.
 */
export function decodeTradeLink(text, stickers) {
  let bytes;
  try {
    bytes = b64urlToBytes((text || "").trim());
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (bytes.length < 6) return { ok: false, reason: "invalid" };

  const version = bytes[0];
  const kind = bytes[1];
  const count = (bytes[2] << 8) | bytes[3];
  const fp = (bytes[4] << 8) | bytes[5];

  if (version !== LINK_FORMAT_VERSION || kind !== KIND_STATE) {
    return { ok: false, reason: "invalid" };
  }
  if (count !== stickers.length || fp !== canonicalFingerprint(stickers)) {
    return { ok: false, reason: "version" };
  }

  const per = Math.ceil(count / 8);
  if (bytes.length < 6 + per * 2) return { ok: false, reason: "invalid" };

  const repBytes = bytes.subarray(6, 6 + per);
  const falBytes = bytes.subarray(6 + per, 6 + per * 2);

  const theirRepetidas = new Set();
  const theirFaltantes = new Set();
  for (let i = 0; i < count; i++) {
    if (readBit(repBytes, i)) theirRepetidas.add(stickers[i].code);
    if (readBit(falBytes, i)) theirFaltantes.add(stickers[i].code);
  }
  return { ok: true, theirRepetidas, theirFaltantes };
}

/**
 * Gera o link de CONFIRMAÇÃO (kind 1), do ponto de vista de QUEM ACEITA/gera.
 * Empacota os pares: `gives` = o que EU (gerador) dou; `receives` = o que EU recebo.
 * @param {Array<{give:Object, receive:Object}>} suggestedPairs
 * @param {Array} stickers — coleção completa (ordem canônica)
 */
export function encodeTradeConfirm(suggestedPairs, stickers) {
  const gives = new Set((suggestedPairs ?? []).map((p) => p?.give?.code).filter(Boolean));
  const receives = new Set((suggestedPairs ?? []).map((p) => p?.receive?.code).filter(Boolean));
  const n = stickers.length;
  const giveBytes = packBits(stickers.map((s) => gives.has(s.code)));
  const recvBytes = packBits(stickers.map((s) => receives.has(s.code)));
  const fp = canonicalFingerprint(stickers);

  const header = new Uint8Array(6);
  header[0] = LINK_FORMAT_VERSION;
  header[1] = KIND_CONFIRM;
  header[2] = (n >> 8) & 0xff;
  header[3] = n & 0xff;
  header[4] = (fp >> 8) & 0xff;
  header[5] = fp & 0xff;

  const out = new Uint8Array(6 + giveBytes.length + recvBytes.length);
  out.set(header, 0);
  out.set(giveBytes, 6);
  out.set(recvBytes, 6 + giveBytes.length);
  return bytesToB64url(out);
}

/**
 * Lê o link de confirmação contra a coleção DESTE usuário (o remetente original).
 * Retorna do MEU ponto de vista (inverte o do gerador):
 *   - theyGive    = códigos que o outro dá  → EU recebo (+1)
 *   - theyReceive = códigos que o outro recebe → EU dou  (-1)
 * @returns {{ok:true, theyGive:Set<string>, theyReceive:Set<string>}
 *          | {ok:false, reason:"invalid"|"version"}}
 */
export function decodeTradeConfirm(text, stickers) {
  let bytes;
  try {
    bytes = b64urlToBytes((text || "").trim());
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (bytes.length < 6) return { ok: false, reason: "invalid" };

  const version = bytes[0];
  const kind = bytes[1];
  const count = (bytes[2] << 8) | bytes[3];
  const fp = (bytes[4] << 8) | bytes[5];

  if (version !== LINK_FORMAT_VERSION || kind !== KIND_CONFIRM) {
    return { ok: false, reason: "invalid" };
  }
  if (count !== stickers.length || fp !== canonicalFingerprint(stickers)) {
    return { ok: false, reason: "version" };
  }

  const per = Math.ceil(count / 8);
  if (bytes.length < 6 + per * 2) return { ok: false, reason: "invalid" };

  const giveBytes = bytes.subarray(6, 6 + per);
  const recvBytes = bytes.subarray(6 + per, 6 + per * 2);

  // No link, gives/receives são do ponto de vista de quem gerou; pra mim, invertem.
  const theyGive = new Set();    // o outro dá → EU recebo
  const theyReceive = new Set(); // o outro recebe → EU dou
  for (let i = 0; i < count; i++) {
    if (readBit(giveBytes, i)) theyGive.add(stickers[i].code);
    if (readBit(recvBytes, i)) theyReceive.add(stickers[i].code);
  }
  return { ok: true, theyGive, theyReceive };
}
