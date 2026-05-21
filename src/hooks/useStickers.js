import { useState, useEffect } from "react";
import { loadStickersFromStorage, saveStickersToStorage } from "@/services/storage.js";

export function useStickers() {
  const [stickers, setStickers] = useState(loadStickersFromStorage);

  useEffect(() => {
    saveStickersToStorage(stickers);
  }, [stickers]);

  return { stickers, setStickers };
}
