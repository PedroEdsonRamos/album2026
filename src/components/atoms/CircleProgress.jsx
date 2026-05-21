import { useState, useEffect } from "react";
import { C } from "@/styles/tokens.js";

export function CircleProgress({ value, size = 80, stroke = 7, color = C.amber }) {
  const r = (size - stroke) / 2;
  const ci = 2 * Math.PI * r;
  const [cur, setCur] = useState(0);

  useEffect(() => {
    let ra, st;
    const run = (ts) => {
      if (!st) st = ts;
      const p = Math.min((ts - st) / 1000, 1);
      setCur((1 - (1 - p) ** 3) * value);
      if (p < 1) ra = requestAnimationFrame(run);
    };
    ra = requestAnimationFrame(run);
    return () => cancelAnimationFrame(ra);
  }, [value]);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={ci}
        strokeDashoffset={ci - (cur / 100) * ci}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
    </svg>
  );
}
