const DAY_MS = 1000 * 60 * 60 * 24;

// The streak is always derived from start_date, never stored as a counter.
// That means there's nothing to keep in sync and no cron job required.
export function currentStreakDays(startDate: string | Date): number {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - start) / DAY_MS));
}
