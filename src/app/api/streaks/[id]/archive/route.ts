import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getUser } from "@/lib/session";
import { currentStreakDays } from "@/lib/streak";
import { LIMITS, clamp } from "@/lib/limits";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const reason = clamp(body?.reason, LIMITS.closingNote);
  if (!reason) {
    return NextResponse.json({ error: "A closing note is required" }, { status: 400 });
  }

  const [s] = await sql`select * from disciplines where id = ${id} and user_id = ${user.id}`;
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const streak = currentStreakDays(s.start_date);
  const newMax = Math.max(s.max_streak, streak);

  const [row] = await sql`
    update disciplines
    set archived = true, archived_at = now(), max_streak = ${newMax}, archive_reason = ${reason}
    where id = ${id} and user_id = ${user.id}
    returning *
  `;
  return NextResponse.json(row);
}
