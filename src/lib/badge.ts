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
// "Reset" affordance all stacked on the vertical center line. A soft glow
// behind the number in the tier color echoes the app icon/favicon.
export function renderBadgeSvg(d: BadgeData, opts?: { interactive?: boolean }): string {
  const name = escapeXml(d.name);
  const tierName = escapeXml(d.tierName.toUpperCase());
  const line = escapeXml(d.line);
  const dayWord = d.days === 1 ? "day" : "days";
  const cx = 240;
  const gradId = "glow";

  const resetButton = `
  <g${opts?.interactive ? ' class="reset-btn" style="cursor:pointer"' : ""}>
    <rect x="170" y="300" width="140" height="40" rx="20" fill="none" stroke="${d.tierColor}" stroke-width="1.5"/>
    <text x="${cx}" y="325" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="1" fill="${d.tierColor}">RESET</text>
  </g>`;

  return `<svg width="480" height="360" viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradId}" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="${d.tierColor}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${d.tierColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="480" height="360" fill="#16140F"/>
  <rect width="480" height="360" fill="url(#${gradId})"/>
  <text x="${cx}" y="52" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="#A69C8A">${name}</text>
  <text x="${cx}" y="170" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="${d.tierColor}">${d.days}</text>
  <text x="${cx}" y="196" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" letter-spacing="2" fill="#A69C8A">${dayWord.toUpperCase()}</text>
  <text x="${cx}" y="234" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="600" letter-spacing="1.5" fill="${d.tierColor}">${tierName}</text>
  <text x="${cx}" y="266" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="#EFE9DE">${line}</text>
  ${resetButton}
</svg>`;
}
