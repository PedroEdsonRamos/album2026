import { ES_PLAYERS, ES_RARITY_TYPES } from "@/data/extraStickers";
import { getFinish } from "@/styles/finishes";

export function getESCollection(stickers) {
  return ES_PLAYERS.map((player) => {
    const regularSticker = stickers.find((s) => s.code === player.linkedCode);
    const collectedTypes = {};
    if (regularSticker && regularSticker.status !== "Faltando") {
      if (regularSticker.typeBreakdown && Object.keys(regularSticker.typeBreakdown).length > 0) {
        Object.entries(regularSticker.typeBreakdown).forEach(([rarity, qty]) => {
          if (ES_RARITY_TYPES.includes(rarity) && qty > 0) collectedTypes[rarity] = qty;
        });
      } else if (ES_RARITY_TYPES.includes(regularSticker.rarity)) {
        collectedTypes[regularSticker.rarity] = 1;
      }
    }
    return { player, collectedTypes };
  });
}

export function countESCollected(stickers) {
  return getESCollection(stickers).reduce(
    (total, { collectedTypes }) => total + Object.keys(collectedTypes).length,
    0
  );
}
