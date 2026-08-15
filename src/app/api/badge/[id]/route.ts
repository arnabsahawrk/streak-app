import sql from "@/lib/db";
import { currentStreakDays } from "@/lib/streak";
import { getTier } from "@/lib/tiers";
import { renderBadgeSvg } from "@/lib/badge";

function htmlPage(bodyInner: string): Response {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Streak</title>
<style>
  body{background:#16140F;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    font-family:-apple-system,system-ui,sans-serif;padding:24px;box-sizing:border-box}
  .wrap{max-width:480px;width:100%}
  svg{width:100%;height:auto;display:block;border-radius:16px}
  form{margin:0}
  .reset-btn:hover rect{fill:rgba(255,255,255,0.06)}
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

  const accept = req.headers.get("accept") ?? "";
  const wantsHtml = accept.includes("text/html");

  if (!wantsHtml) {
    const svg = renderBadgeSvg(badgeData);
    return new Response(svg, {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
    });
  }

  const svg = renderBadgeSvg(badgeData, { interactive: true });
  return htmlPage(`
    <form method="POST" action="?token=${token}">
      ${svg}
    </form>
    <script>
      document.querySelector('.reset-btn').addEventListener('click', function () {
        document.querySelector('form').submit();
      });
    </script>
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

  const badgeData = { name: d.name, days: 0, tierName: "Day 0", tierColor: "#EF4444", line: "Ready when you are." };
  const svg = renderBadgeSvg(badgeData);
  return htmlPage(svg);
}
