export interface Discipline {
  id: string;
  name: string;
  why_note: string | null;
  start_date: string;
  max_streak: number;
  archived: boolean;
  created_at: string;
  public_token: string;
}
