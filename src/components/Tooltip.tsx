"use client";

import { useState, type ReactNode } from "react";

/** Custom tooltip. Deliberately not the browser's title attribute: that
 *  can't be styled, takes a second to appear, and never shows on touch.
 *  This one opens on hover, focus and tap, so it works on a phone too. */
export default function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onTouchStart={() => setOpen((v) => !v)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-ember-line bg-ash-sunk px-2 py-1 text-[11px] font-medium text-paper shadow-lg sm-rise ${
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
