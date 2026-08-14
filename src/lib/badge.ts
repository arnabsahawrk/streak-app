function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderBadgeSvg(opts: {
  name: string;
  days: number;
  tierName: string;
  tierColor: string;
  line: string;
}): string {
  const name = escapeXml(opts.name);
  const tierName = escapeXml(opts.tierName);
  const line = escapeXml(opts.line);
  const dayWord = opts.days === 1 ? "day" : "days";

  return `<svg width="600" height="200" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" fill="#16140F"/>
  <rect x="0" y="0" width="6" height="200" fill="${opts.tierColor}"/>
  <text x="36" y="46" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="600" letter-spacing="1" fill="#A69C8A">${name}</text>
  <text x="36" y="118" font-family="Helvetica, Arial, sans-serif" font-size="72" font-weight="700" fill="${opts.tierColor}">${opts.days}<tspan font-size="24" font-weight="400" fill="#A69C8A" dx="10">${dayWord}</tspan></text>
  <text x="36" y="152" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="600" letter-spacing="1" fill="${opts.tierColor}">${tierName.toUpperCase()}</text>
  <text x="36" y="176" font-family="Helvetica, Arial, sans-serif" font-size="15" font-style="italic" fill="#EFE9DE">${line}</text>
</svg>`;
}
