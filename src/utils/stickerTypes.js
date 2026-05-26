import { ES_BY_CODE } from "@/data/extraStickers";

export const STICKER_CATEGORY = {
  JOGADOR_COMUM: "JOGADOR_COMUM",
  JOGADOR_ES:    "JOGADOR_ES",
  ESCUDO:        "ESCUDO",
  FOTO_EQUIPE:   "FOTO_EQUIPE",
  FWC:           "FWC",
  COCA_COLA:     "COCA_COLA",
};

export function getStickerCategory(s) {
  if (s.team === "CC")              return STICKER_CATEGORY.COCA_COLA;
  if (s.team === "FWC")             return STICKER_CATEGORY.FWC;
  if (s.position === "Escudo")      return STICKER_CATEGORY.ESCUDO;
  if (s.position === "Foto Equipe") return STICKER_CATEGORY.FOTO_EQUIPE;
  if (ES_BY_CODE[s.code])           return STICKER_CATEGORY.JOGADOR_ES;
  return STICKER_CATEGORY.JOGADOR_COMUM;
}

export const ALLOWED_TYPES = {
  [STICKER_CATEGORY.JOGADOR_COMUM]: ["Comum"],
  [STICKER_CATEGORY.JOGADOR_ES]:    ["Comum", "Lilás", "Bronze", "Prata", "Ouro"],
  [STICKER_CATEGORY.ESCUDO]:        ["Metalizado"],
  [STICKER_CATEGORY.FOTO_EQUIPE]:   ["Comum"],
  [STICKER_CATEGORY.FWC]:           ["Metalizado"],
  [STICKER_CATEGORY.COCA_COLA]:     ["Coca-Cola"],
};

export const FIXED_TYPE_CATEGORIES = [
  STICKER_CATEGORY.ESCUDO,
  STICKER_CATEGORY.FOTO_EQUIPE,
  STICKER_CATEGORY.FWC,
  STICKER_CATEGORY.COCA_COLA,
];

export const DEFAULT_TYPE = {
  [STICKER_CATEGORY.JOGADOR_COMUM]: "Comum",
  [STICKER_CATEGORY.JOGADOR_ES]:    "Comum",
  [STICKER_CATEGORY.ESCUDO]:        "Metalizado",
  [STICKER_CATEGORY.FOTO_EQUIPE]:   "Comum",
  [STICKER_CATEGORY.FWC]:           "Metalizado",
  [STICKER_CATEGORY.COCA_COLA]:     "Coca-Cola",
};

export const CATEGORY_LABEL = {
  [STICKER_CATEGORY.JOGADOR_COMUM]: "Jogador",
  [STICKER_CATEGORY.JOGADOR_ES]:    "Jogador Extra Sticker ⭐",
  [STICKER_CATEGORY.ESCUDO]:        "Escudo",
  [STICKER_CATEGORY.FOTO_EQUIPE]:   "Foto da Equipe",
  [STICKER_CATEGORY.FWC]:           "FIFA World Cup",
  [STICKER_CATEGORY.COCA_COLA]:     "Coca-Cola",
};

export function isFixedType(s) {
  return FIXED_TYPE_CATEGORIES.includes(getStickerCategory(s));
}

export function getDefaultRarity(s) {
  return DEFAULT_TYPE[getStickerCategory(s)] ?? "Comum";
}

export function isTypeAllowed(s, finishKey) {
  const allowed = ALLOWED_TYPES[getStickerCategory(s)];
  return allowed?.includes(finishKey) ?? false;
}
