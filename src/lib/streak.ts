const DAY_MS = 1000 * 60 * 60 * 24;

// The streak is always derived from start_date, never stored as a counter.
// That means there's nothing to keep in sync and no cron job required.
// Pass `asOf` to compute the streak as it stood at a fixed moment (e.g. the
// moment something was archived) instead of live, right now.
export function currentStreakDays(
  startDate: string | Date,
  asOf: string | Date = new Date()
): number {
  const start = new Date(startDate).getTime();
  const end = new Date(asOf).getTime();
  return Math.max(0, Math.floor((end - start) / DAY_MS));
}
