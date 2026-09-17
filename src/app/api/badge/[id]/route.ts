import sql from "@/lib/db";
import { viewOf } from "@/lib/progress";
import { renderBadgeSvg } from "@/lib/badge";

// Read-only by design: this URL only ever returns a live SVG snapshot of
// the discipline's current state. No reset, no POST, nothing state-changing
// reachable from outside the app.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("token");

  const [d] = await sql`select * from disciplines where id = ${id}`;
  if (!d || !token || token !== d.public_token || d.archived) {
    return new Response("Not found", { status: 404 });
  }

  const v = viewOf({ start_date: d.start_date, goal_days: d.goal_days });
  const svg = renderBadgeSvg(
    {
      name: d.name,
      days: v.days,
      caption: v.caption,
      pill: v.pill ?? "",
      color: v.color,
      line: v.line,
    },
    v.isPaused
  );
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}
