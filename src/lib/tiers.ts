export interface Tier {
  name: string;
  line: string;
  color: string;
  min: number;
}

export const TIERS: Tier[] = [
  { name: "Begin", line: "I started.", color: "#EF4444", min: 1 },
  { name: "Commit", line: "I chose this.", color: "#F97316", min: 3 },
  { name: "Control", line: "I am gaining control.", color: "#F59E0B", min: 7 },
  { name: "Discipline", line: "I am becoming disciplined.", color: "#EAB308", min: 15 },
  { name: "Consistent", line: "I am staying consistent.", color: "#84CC16", min: 21 },
  { name: "Thrive", line: "I am growing consistently.", color: "#22C55E", min: 30 },
  { name: "Strong", line: "I am becoming stronger.", color: "#14B8A6", min: 60 },
  { name: "Dedicated", line: "I stay committed.", color: "#3B82F6", min: 90 },
  { name: "Master", line: "I have built strong discipline.", color: "#A78BFA", min: 180 },
  { name: "Legend", line: "I keep my commitment alive.", color: "#F5C542", min: 365 },
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
