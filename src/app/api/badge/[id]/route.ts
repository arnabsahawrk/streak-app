import sql from "@/lib/db";
import { currentStreakDays } from "@/lib/streak";
import { getTier } from "@/lib/tiers";
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

  const days = currentStreakDays(d.start_date);
  const tier = getTier(days);

  const svg = renderBadgeSvg({
    name: d.name,
    days,
    tierName: tier.name,
    tierColor: tier.color,
    line: tier.line,
  });

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}
