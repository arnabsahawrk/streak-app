"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { dayWord } from "@/lib/format";

export default function StreakCounter({
  value,
  color,
}: {
  value: number;
  color: string;
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
    <div className="text-center">
      <p
        className="font-mono text-6xl font-bold tabular-nums leading-none"
        style={{ color }}
      >
        {display}
      </p>
      <p className="text-paper-dim text-[10px] tracking-[0.25em] uppercase mt-2">
        {dayWord(display)}
      </p>
    </div>
  );
}
