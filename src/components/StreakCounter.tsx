"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

export default function StreakCounter({
  value,
  label,
  caption,
  color,
}: {
  value: number;
  /** Pre-capped string ("365+"); the animation still runs on the number. */
  label: string;
  caption: string;
  color: string;
}) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const capped = label.endsWith("+");

  useEffect(() => {
    if (capped) return;
    const controls = animate(prev.current, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, capped]);

  return (
    <div className="px-3 text-center">
      <p className="font-mono text-6xl font-bold leading-none tabular-nums sm-flicker" style={{ color }}>
        {capped ? label : display}
      </p>
      <p className="mt-2 text-[10px] uppercase leading-tight tracking-[0.25em] text-paper-dim">{caption}</p>
    </div>
  );
}
