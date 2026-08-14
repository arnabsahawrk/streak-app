import sql from "@/lib/db";
import { currentStreakDays } from "@/lib/streak";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(title: string, body: string, status = 200): Response {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<style>
  body{background:#16140F;color:#EFE9DE;font-family:-apple-system,system-ui,sans-serif;
    display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px}
  .card{max-width:360px;width:100%;text-align:center}
  h1{font-size:1.3rem;margin:0 0 8px}
  p{color:#A69C8A;font-size:0.9rem;line-height:1.5}
  button{background:#E8703A;color:#16140F;border:0;border-radius:10px;padding:12px 20px;
    font-weight:600;font-size:0.95rem;margin-top:16px;cursor:pointer}
</style></head>
<body><div class="card">${body}</div></body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("token") ?? "";

  const [d] = await sql`select * from disciplines where id = ${id}`;
  if (!d || token !== d.public_token) {
    return page("Not found", `<h1>Not found</h1><p>This link isn't valid.</p>`, 404);
  }

  const days = currentStreakDays(d.start_date);

  return page(
    "Confirm reset",
    `<h1>Reset "${escapeHtml(d.name)}"?</h1>
     <p>Day ${days} ends here. This can't be undone from this page.</p>
     <form method="POST">
       <input type="hidden" name="token" value="${token}"/>
       <button type="submit">Confirm reset</button>
     </form>`
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = await req.formData();
  const token = String(form.get("token") ?? "");

  const [d] = await sql`select * from disciplines where id = ${id}`;
  if (!d || token !== d.public_token) {
    return page("Not found", `<h1>Not found</h1><p>This link isn't valid.</p>`, 404);
  }

  const streak = currentStreakDays(d.start_date);
  const newMax = Math.max(d.max_streak, streak);

  await sql`
    update disciplines set start_date = now(), max_streak = ${newMax} where id = ${id}
  `;
  if (streak > 0) {
    await sql`insert into reset_log (discipline_id, streak_reached) values (${id}, ${streak})`;
  }

  return page(
    "Reset",
    `<h1>Done</h1><p>"${escapeHtml(d.name)}" is back to day 0. The streak starts again now.</p>`
  );
}
