import { currentStreakDays } from "@/lib/streak";
import { getTier, nextTier, type Tier } from "@/lib/tiers";
import { dayWord } from "@/lib/format";

export const NEUTRAL = "#8A8578";
export const GOLD = "#D4AF37";

export const PAUSED_LINE = "No rush. Start again when you're ready.";
export const COMPLETE_LINE = "Done. I said I would, and I did.";

/** Challenge lengths offered as one-tap presets when creating a commitment. */
export const CHALLENGE_PRESETS = [3, 7, 21, 30];
export const MAX_GOAL_DAYS = 365;

export interface StreakView {
  isPaused: boolean;
  isChallenge: boolean;
  isComplete: boolean;
  days: number;
  goalDays: number | null;
  /** 0..1, drives the ring. */
  progress: number;
  color: string;
  /** null while paused, or on a challenge (the ladder doesn't apply there). */
  tier: Tier | null;
  upNext: Tier | null;
  line: string;
  /** Small-caps caption under the big number. */
  caption: string;
  /** Pill above the line; null means render no pill. */
  pill: string | null;
}

/**
 * Normalises a discipline into everything the UI needs to draw it.
 *
 * Two shapes of commitment share this:
 *   - goal_days === null  -> the open-ended tier ladder (Begin ... Legend)
 *   - goal_days === N     -> a fixed N-day challenge that completes at N
 *
 * `goal_days` is read with `?? null`, which also catches `undefined`. That
 * matters: if the column hasn't been added to the database yet, every row
 * comes back without the field and every commitment simply behaves as a
 * ladder commitment — exactly how it behaved before challenges existed —
 * instead of throwing. A missing migration degrades, it doesn't break.
 */
export function viewOf(d: {
  start_date: string | null;
  goal_days?: number | null;
}): StreakView {
  const isPaused = d.start_date === null;
  const days = currentStreakDays(d.start_date);
  const goalDays = d.goal_days ?? null;
  const isChallenge = goalDays !== null && goalDays > 0;
  const isComplete = isChallenge && !isPaused && days >= (goalDays as number);

  if (isPaused) {
    return {
      isPaused: true,
      isChallenge,
      isComplete: false,
      days: 0,
      goalDays,
      progress: 0,
      color: NEUTRAL,
      tier: null,
      upNext: null,
      line: PAUSED_LINE,
      caption: "PAUSED",
      pill: isChallenge ? `${goalDays}-DAY CHALLENGE` : null,
    };
  }

  const tier = getTier(days);

  if (isChallenge) {
    const goal = goalDays as number;
    return {
      isPaused: false,
      isChallenge: true,
      isComplete,
      days,
      goalDays: goal,
      progress: Math.min(1, days / goal),
      color: isComplete ? GOLD : tier.color,
      tier: null,
      upNext: null,
      line: isComplete ? COMPLETE_LINE : tier.line,
      caption: isComplete ? "COMPLETE" : `OF ${goal} ${dayWord(goal).toUpperCase()}`,
      pill: `${goal}-DAY CHALLENGE`,
    };
  }

  const upNext = nextTier(days);
  return {
    isPaused: false,
    isChallenge: false,
    isComplete: false,
    days,
    goalDays: null,
    progress: upNext ? (days - tier.min) / (upNext.min - tier.min) : 1,
    color: tier.color,
    tier,
    upNext,
    line: tier.line,
    caption: dayWord(days).toUpperCase(),
    pill: tier.name,
  };
}
