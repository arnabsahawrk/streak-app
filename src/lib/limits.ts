/** Shared text ceilings. Mirrored by CHECK constraints in schema.sql so a
 *  bug in one layer can't bypass the other. Deliberately generous: these
 *  exist to stop a runaway paste from eating free-tier disk, not to make
 *  anyone write less than they need to. */
export const LIMITS = {
  name: 80,
  why: 1200,
  closingNote: 1200,
  resetNote: 1200,
  chat: 4000,
  displayName: 80,
  commitmentUrl: 500,
  commitmentLabel: 60,
} as const;

export function clamp(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
