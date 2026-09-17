import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getUser } from "@/lib/session";

/** Everything about one streak in a single round trip: the row, its reset
 *  history (which the heatmap reconstructs days from), its journal, and
 *  any cached AI insight. Used by the detail sheet and the archive view. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [streak] = await sql`
    select * from disciplines where id = ${id} and user_id = ${user.id}
  `;
  if (!streak) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [resets, chat, insight] = await Promise.all([
    sql`select id, streak_reached, note, run_start, reset_at from reset_log
        where discipline_id = ${id} order by reset_at desc`,
    sql`select id, body, created_at from chat_messages
        where discipline_id = ${id} order by created_at asc`,
    sql`select content, created_at from ai_insights
        where discipline_id = ${id} and kind = 'pattern'
        order by created_at desc limit 1`,
  ]);

  return NextResponse.json({
    streak,
    resets,
    chat,
    insight: insight[0] ?? null,
  });
}
