import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getUser } from "@/lib/session";
import { groq, PATTERN_SYSTEM } from "@/lib/ai";
import { formatDateTime } from "@/lib/format";

/** Reads the journal and reset history for one streak and surfaces the
 *  patterns in it. Cached in ai_insights so reopening the sheet doesn't
 *  re-spend the Groq rate limit. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [streak] = await sql`
    select name, why_note from disciplines where id = ${id} and user_id = ${user.id}
  `;
  if (!streak) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [chat, resets] = await Promise.all([
    sql`select body, created_at from chat_messages where discipline_id = ${id}
        order by created_at asc limit 120`,
    sql`select streak_reached, note, run_start, reset_at from reset_log
        where discipline_id = ${id} order by reset_at asc limit 60`,
  ]);

  if (chat.length + resets.length < 3) {
    return NextResponse.json(
      { error: "Not enough written down yet — add a few journal notes first." },
      { status: 400 }
    );
  }

  const material = [
    `Habit: ${streak.name}`,
    `Their reason: ${streak.why_note}`,
    "",
    "Journal entries:",
    ...chat.map((c) => `- ${formatDateTime(c.created_at)}: ${c.body}`),
    "",
    "Times the streak broke:",
    ...resets.map(
      (r) =>
        `- broke on ${formatDateTime(r.reset_at)} after ${r.streak_reached} days` +
        (r.note ? ` — they wrote: ${r.note}` : "")
    ),
  ].join("\n");

  const out = await groq(PATTERN_SYSTEM, material, 500);
  if (!out) {
    return NextResponse.json({ error: "The insight service is unavailable right now." }, { status: 503 });
  }

  await sql`
    insert into ai_insights (user_id, discipline_id, kind, content)
    values (${user.id}, ${id}, 'pattern', ${out})
  `;
  return NextResponse.json({ content: out, created_at: new Date().toISOString() });
}
