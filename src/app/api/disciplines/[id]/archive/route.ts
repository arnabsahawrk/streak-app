import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { currentStreakDays } from "@/lib/streak";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  if (!reason) {
    return NextResponse.json({ error: "A reason is required" }, { status: 400 });
  }

  const [d] = await sql`select * from disciplines where id = ${id}`;
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const streak = currentStreakDays(d.start_date);
  const newMax = Math.max(d.max_streak, streak);

  const [updated] = await sql`
    update disciplines
    set archived = true, archived_at = now(), max_streak = ${newMax}, archive_reason = ${reason}
    where id = ${id}
    returning *
  `;
  return NextResponse.json(updated);
}
