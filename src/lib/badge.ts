import { dayWord } from "@/lib/format";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface BadgeData {
  name: string;
  days: number;
  tierName: string;
  tierColor: string;
  line: string;
}

// Centered composition: name, huge number, tier, motivating line, and a
// "Reset" shape all stacked on the vertical center line. The button drawn
// here is purely visual in every case — actual click handling is a real
// HTML <button> overlaid on top of it by the route handler, not anything
// baked into the SVG. That's deliberate: a native form submit works even
// inside a restrictive iframe sandbox; JS-driven SVG click handlers don't
// reliably.
export function renderBadgeSvg(d: BadgeData): string {
  const name = escapeXml(d.name);
  const tierName = escapeXml(d.tierName.toUpperCase());
  const line = escapeXml(d.line);
  const dw = dayWord(d.days);
  const cx = 240;

  return `<svg width="480" height="360" viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="${d.tierColor}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${d.tierColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="480" height="360" fill="#16140F"/>
  <rect width="480" height="360" fill="url(#glow)"/>
  <text x="${cx}" y="52" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="#A69C8A">${name}</text>
  <text x="${cx}" y="170" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="${d.tierColor}">${d.days}</text>
  <text x="${cx}" y="196" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" letter-spacing="2" fill="#A69C8A">${dw.toUpperCase()}</text>
  <text x="${cx}" y="234" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="600" letter-spacing="1.5" fill="${d.tierColor}">${tierName}</text>
  <text x="${cx}" y="266" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="#EFE9DE">${line}</text>
  <rect x="170" y="300" width="140" height="40" rx="20" fill="none" stroke="${d.tierColor}" stroke-width="1.5"/>
  <text x="${cx}" y="325" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="1" fill="${d.tierColor}">RESET</text>
</svg>`;
}
