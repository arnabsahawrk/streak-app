function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface BadgeData {
  name: string;
  daysLabel: string;
  caption: string;
  pill: string;
  color: string;
  line: string;
  paused: boolean;
}

/** Live share image. Re-rendered on every request from current data, so a
 *  single unchanging URL always shows today's number - embeddable in
 *  Notion, a README, a blog, a dashboard, anywhere an image tag works. */
export function renderBadgeSvg(d: BadgeData): string {
  const color = d.paused ? "#8A8578" : d.color;
  const count = d.paused ? "&#8212;" : esc(d.daysLabel);
  const pill = d.paused ? "" : esc(d.pill.toUpperCase());

  return `<svg width="480" height="300" viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(d.name)}: ${esc(d.daysLabel)}">
  <defs>
    <radialGradient id="g" cx="50%" cy="45%" r="62%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="480" height="300" rx="18" fill="#14110E"/>
  <rect width="480" height="300" rx="18" fill="url(#g)"/>
  <rect x="0.5" y="0.5" width="479" height="299" rx="18" fill="none" stroke="#2E2620"/>
  <text x="240" y="44" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="2.5" fill="#A79C8C">${esc(d.name).toUpperCase()}</text>
  <text x="240" y="158" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="82" font-weight="700" fill="${color}">${count}</text>
  <text x="240" y="184" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="14" letter-spacing="2" fill="#A79C8C">${esc(d.caption)}</text>
  ${pill ? `<text x="240" y="220" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="12" font-weight="700" letter-spacing="1.5" fill="${color}">${pill}</text>` : ""}
  <text x="240" y="${pill ? 252 : 232}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="17" font-weight="700" fill="#F2ECE3">${esc(d.line)}</text>
  <text x="240" y="282" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="10" letter-spacing="1.5" fill="#5C554B">STREAKMENT</text>
</svg>`;
}
