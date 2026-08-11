export interface Discipline {
  id: string;
  name: string;
  color: string;
  why_note: string | null;
  start_date: string;
  max_streak: number;
  archived: boolean;
  created_at: string;
}
