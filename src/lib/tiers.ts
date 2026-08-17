export interface Tier {
  name: string;
  line: string;
  color: string;
  min: number;
}

// Colors follow how metal actually changes color under heat and tempering
// rather than an arbitrary rainbow: early tiers are the incandescence
// sequence a blacksmith sees as metal heats up (dull red -> red -> orange
// -> yellow -> near-white), matching the struggle in those tiers' lines.
// Dedicated onward switches to real tempering colors (the oxide colors
// steel takes on as it's held and cools into its hardened form: bronze,
// then blue), matching how those lines shift from striving to settled
// identity. Legend breaks from steel into gold — the finished, precious
// result of the whole process.
export const ZERO_STATE: Tier = {
  name: "Day 0",
  line: "I can do this all day.",
  color: "#8A8578", // unlit iron - no heat yet
  min: 0,
};

export const TIERS: Tier[] = [
  { name: "Begin", line: "I decided to change.", color: "#B91C1C", min: 1 },
  { name: "Commit", line: "I chose the better path.", color: "#DC2626", min: 3 },
  { name: "Control", line: "I am learning to control myself.", color: "#EA580C", min: 7 },
  { name: "Discipline", line: "I am building a new me.", color: "#F97316", min: 15 },
  { name: "Consistent", line: "This is becoming who I am.", color: "#F59E0B", min: 21 },
  { name: "Thrive", line: "My old habits are losing their hold.", color: "#EAB308", min: 30 },
  { name: "Strong", line: "I am no longer who I used to be.", color: "#FDE047", min: 60 },
  { name: "Dedicated", line: "I live by my commitment.", color: "#B45309", min: 90 },
  { name: "Master", line: "Discipline has become part of me.", color: "#3B82F6", min: 180 },
  { name: "Legend", line: "I became the person I promised to become.", color: "#D4AF37", min: 365 },
];

export function getTier(days: number): Tier {
  if (days <= 0) return ZERO_STATE;
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (days >= tier.min) current = tier;
  }
  return current;
}

export function nextTier(days: number): Tier | null {
  return TIERS.find((tier) => tier.min > days) ?? null;
}
