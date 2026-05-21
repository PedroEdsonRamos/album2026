import { useState, useEffect } from "react";

export function useCounter(target, dur = 1100) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let startTime = null;
    let raf;
    const run = (t) => {
      if (!startTime) startTime = t;
      const p = Math.min((t - startTime) / dur, 1);
      setVal(Math.round((1 - (1 - p) ** 3) * target));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);

  return val;
}
