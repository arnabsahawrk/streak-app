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
  /** Big number. */
  days: number;
  /** Small caps under the number, e.g. "DAYS", "OF 3 DAYS", "COMPLETE". */
  caption: string;
  /** Tier name / challenge label; empty string renders no pill line. */
  pill: string;
  color: string;
  line: string;
}

const PAUSED_COLOR = "#8A8578";

// Centered composition: name, huge number, tier, and motivating line
// stacked on the vertical center line. Read-only image, nothing clickable
// baked into it.
export function renderBadgeSvg(d: BadgeData, paused = false): string {
  const name = escapeXml(d.name);
  const color = paused ? PAUSED_COLOR : d.color;
  const countText = paused ? "\u2014" : String(d.days);
  const captionText = escapeXml(d.caption.toUpperCase());
  const tierText = escapeXml(paused ? "" : d.pill.toUpperCase());
  const line = escapeXml(d.line);
  const cx = 240;

  return `<svg width="480" height="300" viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="480" height="300" fill="#16140F"/>
  <rect width="480" height="300" fill="url(#glow)"/>
  <text x="${cx}" y="46" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="#A69C8A">${name}</text>
  <text x="${cx}" y="160" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="84" font-weight="700" fill="${color}">${countText}</text>
  <text x="${cx}" y="186" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" letter-spacing="2" fill="#A69C8A">${captionText}</text>
  ${tierText ? `<text x="${cx}" y="223" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="600" letter-spacing="1.5" fill="${color}">${tierText}</text>` : ""}
  <text x="${cx}" y="${tierText ? 255 : 234}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="#EFE9DE">${line}</text>
</svg>`;
}
