import sql from "@/lib/db";
import { viewOf } from "@/lib/progress";
import { renderBadgeSvg } from "@/lib/badge";

/** Public, read-only, token-authenticated. No session needed - that's the
 *  point, so the image renders wherever it's embedded. Nothing
 *  state-changing is reachable here, and an archived streak stops
 *  resolving entirely. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("token");

  const [s] = await sql`select * from disciplines where id = ${id}`;
  if (!s || !token || token !== s.public_token || s.archived) {
    return new Response("Not found", { status: 404 });
  }

  const v = viewOf({ start_date: s.start_date, kind: s.kind, goal_days: s.goal_days });
  const svg = renderBadgeSvg({
    name: s.name,
    daysLabel: v.daysLabel,
    caption: v.caption,
    pill: v.pill ?? "",
    color: v.color,
    line: v.line,
    paused: v.isPaused,
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
