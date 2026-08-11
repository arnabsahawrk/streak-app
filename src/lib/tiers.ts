export interface Tier {
  name: string;
  color: string;
  min: number;
}

// Rename or recolor freely — nothing else in the app depends on these
// specific names, just on `min` being sorted ascending.
export const TIERS: Tier[] = [
  { name: "Spark", color: "#8A8578", min: 0 },
  { name: "Ember", color: "#EF4444", min: 1 },
  { name: "Flame", color: "#F97316", min: 3 },
  { name: "Blaze", color: "#F59E0B", min: 7 },
  { name: "Bonfire", color: "#EAB308", min: 15 },
  { name: "Wildfire", color: "#84CC16", min: 21 },
  { name: "Inferno", color: "#22C55E", min: 30 },
  { name: "Phoenix", color: "#14B8A6", min: 60 },
  { name: "Diamond", color: "#3B82F6", min: 90 },
  { name: "Titanium", color: "#A78BFA", min: 180 },
  { name: "Legend", color: "#F5C542", min: 365 },
];

export function getTier(days: number): Tier {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (days >= tier.min) current = tier;
  }
  return current;
}

export function nextTier(days: number): Tier | null {
  return TIERS.find((tier) => tier.min > days) ?? null;
}
