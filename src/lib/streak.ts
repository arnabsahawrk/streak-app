const DAY_MS = 1000 * 60 * 60 * 24;

// The streak is always derived from start_date, never stored as a counter.
// That means there's nothing to keep in sync and no cron job required.
// Pass `asOf` to compute the streak as it stood at a fixed moment (e.g. the
// moment something was archived) instead of live, right now.
//
// start_date is null while a discipline is paused (reset, but not yet
// restarted) - treat that as zero everywhere rather than letting callers
// each reinvent the null check. This matters beyond display: it's what
// keeps archiving a paused discipline from corrupting max_streak (without
// this, new Date(null) resolves to the Unix epoch, and the "days since"
// math would produce a streak of tens of thousands of days).
export function currentStreakDays(
  startDate: string | Date | null,
  asOf: string | Date = new Date()
): number {
  if (!startDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(asOf).getTime();
  return Math.max(0, Math.floor((end - start) / DAY_MS));
}
