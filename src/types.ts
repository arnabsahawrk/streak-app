export interface Discipline {
  id: string;
  name: string;
  why_note: string;
  start_date: string | null;
  max_streak: number;
  archived: boolean;
  archived_at: string | null;
  reset_count: number;
  created_at: string;
  public_token: string;
  archive_reason: string | null;
  /** null = open-ended tier ladder; N = fixed N-day challenge. Optional so
   *  rows from a database that predates the column still satisfy the type. */
  goal_days?: number | null;
}

export interface ResetEntry {
  id: string;
  streak_reached: number;
  note: string | null;
  run_start: string;
  reset_at: string;
}
