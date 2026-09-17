"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { dayWord } from "@/lib/format";

export default function StreakCounter({
  value,
  color,
  caption,
}: {
  value: number;
  color: string;
  /** Overrides the default day/days label - e.g. "OF 3 DAYS" on a
   *  challenge, or "COMPLETE" once one is finished. */
  caption?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <div className="text-center px-2">
      <p
        className="font-mono text-6xl font-bold tabular-nums leading-none"
        style={{ color }}
      >
        {display}
      </p>
      <p className="text-paper-dim text-[10px] tracking-[0.25em] uppercase mt-2 leading-tight">
        {caption ?? dayWord(display).toUpperCase()}
      </p>
    </div>
  );
}
