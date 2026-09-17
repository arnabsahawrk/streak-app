export type StreakKind = "ascent" | "sprint";

export interface Streak {
  id: string;
  user_id: string;
  name: string;
  why_note: string;
  kind: StreakKind;
  goal_days: number | null;
  start_date: string | null;
  max_streak: number;
  reset_count: number;
  archived: boolean;
  archived_at: string | null;
  archive_reason: string | null;
  public_token: string;
  created_at: string;
}

export interface ResetEntry {
  id: string;
  streak_reached: number;
  note: string | null;
  run_start: string;
  reset_at: string;
}

export interface ChatMessage {
  id: string;
  body: string;
  created_at: string;
}

export interface UserSettings {
  display_name: string | null;
  date_of_birth: string | null;
  email_milestones: boolean;
  email_weekly: boolean;
  timezone: string;
  commitment_url: string | null;
  commitment_label: string | null;
  has_passcode?: boolean;
}
