import sql from "@/lib/db";
import { currentStreakDays } from "@/lib/streak";
import { getTier, ZERO_STATE } from "@/lib/tiers";
import { renderBadgeSvg } from "@/lib/badge";

// The clickable "RESET" shape drawn in the SVG sits at x=170 y=300 w=140
// h=40 inside a 480x360 viewBox. This overlay is a REAL <button> positioned
// (as percentages, so it scales with the SVG) exactly on top of that shape.
// It's a native form submit, not a JS click handler on an SVG element —
// that matters because this page gets embedded in Notion's iframe via
// /embed, and a plain form submission works there without depending on
// third-party-iframe script execution behaving a particular way.
const BTN_STYLE =
  "position:absolute;left:35.42%;top:83.33%;width:29.17%;height:11.11%;" +
  "background:transparent;border:0;padding:0;margin:0;cursor:pointer;";

function htmlPage(bodyInner: string): Response {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Streak</title>
<style>
  body{background:#16140F;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    font-family:-apple-system,system-ui,sans-serif;padding:24px;box-sizing:border-box}
  .wrap{max-width:480px;width:100%;position:relative}
  svg{width:100%;height:auto;display:block;border-radius:16px}
  form{margin:0}
</style></head>
<body><div class="wrap">${bodyInner}</div></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function loadDiscipline(id: string, token: string | null) {
  const [d] = await sql`select * from disciplines where id = ${id}`;
  if (!d || !token || token !== d.public_token) return null;
  return d;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("token");
  const d = await loadDiscipline(id, token);

  if (!d) {
    return new Response("Not found", { status: 404 });
  }

  const days = currentStreakDays(d.start_date);
  const tier = getTier(days);
  const badgeData = { name: d.name, days, tierName: tier.name, tierColor: tier.color, line: tier.line };

  // A real navigation (top-level, or a Notion /embed iframe loading its src)
  // sends an Accept header that prioritizes text/html. An <img> tag fetching
  // this as a picture does not. Same URL either way — image for pasting as
  // a static image, interactive page (with a real button) for /embed.
  const accept = req.headers.get("accept") ?? "";
  const wantsHtml = accept.includes("text/html");

  if (!wantsHtml) {
    const svg = renderBadgeSvg(badgeData);
    return new Response(svg, {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
    });
  }

  const svg = renderBadgeSvg(badgeData);
  return htmlPage(`
    <form method="POST" action="?token=${token}">
      ${svg}
      <button type="submit" aria-label="Reset" style="${BTN_STYLE}"></button>
    </form>
  `);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("token");
  const d = await loadDiscipline(id, token);

  if (!d) {
    return new Response("Not found", { status: 404 });
  }

  const streak = currentStreakDays(d.start_date);
  const newMax = Math.max(d.max_streak, streak);

  await sql`
    update disciplines set start_date = now(), max_streak = ${newMax} where id = ${id}
  `;
  if (streak > 0) {
    await sql`
      insert into reset_log (discipline_id, streak_reached, note, run_start)
      values (${id}, ${streak}, 'Reset from Notion', ${d.start_date})
    `;
    await sql`update disciplines set reset_count = reset_count + 1 where id = ${id}`;
  }

  const badgeData = {
    name: d.name,
    days: 0,
    tierName: ZERO_STATE.name,
    tierColor: ZERO_STATE.color,
    line: ZERO_STATE.line,
  };
  const svg = renderBadgeSvg(badgeData);
  return htmlPage(`
    <form method="POST" action="?token=${token}">
      ${svg}
      <button type="submit" aria-label="Reset" style="${BTN_STYLE}"></button>
    </form>
  `);
}
