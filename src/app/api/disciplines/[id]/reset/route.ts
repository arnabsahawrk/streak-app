import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { currentStreakDays } from "@/lib/streak";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const note =
    typeof body?.note === "string" && body.note.trim() ? body.note.trim() : null;

  const [discipline] = await sql`select * from disciplines where id = ${id}`;
  if (!discipline) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const streak = currentStreakDays(discipline.start_date);
  const newMax = Math.max(discipline.max_streak, streak);

  // Pause rather than restart: start_date goes to null, so nothing counts
  // again until an explicit Start. currentStreakDays(null) is 0, so this
  // is safe even if reset is somehow called on an already-paused
  // discipline - streak is 0, newMax is unchanged, and no log entry (or
  // reset_count bump) happens below since there's nothing to log.
  const [updated] = await sql`
    update disciplines
    set start_date = null, max_streak = ${newMax}
    where id = ${id}
    returning *
  `;

  let finalRow = updated;
  if (streak > 0) {
    await sql`
      insert into reset_log (discipline_id, streak_reached, note, run_start)
      values (${id}, ${streak}, ${note}, ${discipline.start_date})
    `;
    const [bumped] = await sql`
      update disciplines set reset_count = reset_count + 1 where id = ${id} returning *
    `;
    finalRow = bumped;
  }

  return NextResponse.json(finalRow);
}
