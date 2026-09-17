"use client";

import { buildHeatmap, type DayStatus } from "@/lib/heatmap";
import type { ResetEntry } from "@/lib/types";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function cellStyle(status: DayStatus, color: string) {
  switch (status) {
    case "held":
      return { backgroundColor: `${color}D9`, borderColor: color };
    case "broken":
      return { backgroundColor: "#7F1D1D", borderColor: "#DC2626" };
    case "idle":
      return { backgroundColor: "transparent", borderColor: "#2E2620" };
    default:
      return { backgroundColor: "transparent", borderColor: "transparent" };
  }
}

/** Months only ever start at the month the streak began - a streak begun
 *  in September never renders an empty May. Every day is reconstructed
 *  from run boundaries already in the database. */
export default function Heatmap({
  streak,
  resets,
  color,
}: {
  streak: { start_date: string | null; created_at: string };
  resets: ResetEntry[];
  color: string;
}) {
  const months = buildHeatmap(streak, resets);
  const recent = months.slice(-6).reverse();

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-paper-dim">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border" style={cellStyle("held", color)} /> held
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border" style={cellStyle("broken", color)} /> broke
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border" style={cellStyle("idle", color)} /> not running
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {recent.map((m) => (
          <div key={`${m.year}-${m.month}`}>
            <p className="mb-2 text-xs font-semibold text-paper">{m.label}</p>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d, i) => (
                <span key={i} className="text-center text-[9px] text-paper-dim">{d}</span>
              ))}
              {Array.from({ length: m.firstWeekday }, (_, i) => (
                <span key={`pad-${i}`} />
              ))}
              {Array.from({ length: m.daysInMonth }, (_, i) => {
                const day = i + 1;
                const status = m.days[day];
                return (
                  <span
                    key={day}
                    title={`${m.label} ${day} — ${status === "future" ? "upcoming" : status}`}
                    className="flex aspect-square items-center justify-center rounded-sm border text-[9px] text-paper-dim"
                    style={cellStyle(status, color)}
                  >
                    {status === "broken" ? "" : ""}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {months.length > 6 && (
        <p className="mt-3 text-[11px] text-paper-dim">Showing the last 6 months of {months.length}.</p>
      )}
    </div>
  );
}
