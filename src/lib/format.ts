export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Per explicit preference: 0 and 1 both read as singular "day", only 2+ is "days".
export function dayWord(n: number): string {
  return n <= 1 ? "day" : "days";
}
