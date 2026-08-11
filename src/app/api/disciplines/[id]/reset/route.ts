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

  const [updated] = await sql`
    update disciplines
    set start_date = now(), max_streak = ${newMax}
    where id = ${id}
    returning *
  `;

  if (streak > 0) {
    await sql`
      insert into reset_log (discipline_id, streak_reached, note)
      values (${id}, ${streak}, ${note})
    `;
  }

  return NextResponse.json(updated);
}
