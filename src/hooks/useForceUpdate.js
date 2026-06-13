import { useState, useCallback } from "react";

/**
 * Força um re-render do componente sem alterar estado de negócio.
 */
export function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}
