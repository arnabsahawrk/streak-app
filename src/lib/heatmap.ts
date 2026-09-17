import type { ResetEntry } from "./types";

export type DayStatus = "held" | "broken" | "idle" | "future";

export interface MonthGrid {
  year: number;
  month: number; // 0-11
  label: string;
  /** Day-of-month (1-indexed) -> status. */
  days: Record<number, DayStatus>;
  firstWeekday: number;
  daysInMonth: number;
}

function key(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function eachDay(from: Date, to: Date, fn: (d: Date) => void) {
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  let guard = 0;
  while (cur <= end && guard++ < 4000) {
    fn(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
}

/**
 * Rebuilds a day-by-day record from data already stored - every completed
 * run is bounded by reset_log.run_start..reset_at, and the live run by
 * start_date..today. No per-day rows are kept anywhere.
 *
 * Months before the streak existed are never produced: the grid starts at
 * the month of the earliest run (or creation), so a streak begun in
 * September never renders an empty May.
 */
export function buildHeatmap(
  streak: { start_date: string | null; created_at: string },
  resets: ResetEntry[],
  today: Date = new Date()
): MonthGrid[] {
  const status = new Map<string, DayStatus>();

  const runs: Array<{ start: Date; end: Date; broke: boolean }> = resets.map((r) => ({
    start: new Date(r.run_start),
    end: new Date(r.reset_at),
    broke: true,
  }));
  if (streak.start_date) {
    runs.push({ start: new Date(streak.start_date), end: today, broke: false });
  }

  for (const run of runs) {
    eachDay(run.start, run.end, (d) => status.set(key(d), "held"));
    // The reset day itself is the break, and overwrites the held marker.
    if (run.broke) status.set(key(run.end), "broken");
  }

  const earliest = runs.length
    ? runs.reduce((a, b) => (a.start < b.start ? a : b)).start
    : new Date(streak.created_at);

  const grids: MonthGrid[] = [];
  const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  const last = new Date(today.getFullYear(), today.getMonth(), 1);
  let guard = 0;

  while (cursor <= last && guard++ < 240) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Record<number, DayStatus> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const k = key(d);
      days[day] = d > today ? "future" : (status.get(k) ?? "idle");
    }

    grids.push({
      year,
      month,
      label: cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      days,
      firstWeekday: new Date(year, month, 1).getDay(),
      daysInMonth,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return grids;
}
