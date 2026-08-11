"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

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
    <p className="font-mono text-4xl font-semibold tabular-nums leading-none" style={{ color }}>
      {display}
      <span className="text-base font-normal text-paper-dim ml-1.5">
        {display === 1 ? "day" : "days"}
      </span>
    </p>
  );
}
