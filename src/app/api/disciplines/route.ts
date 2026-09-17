import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: Request) {
  const archivedOnly = new URL(req.url).searchParams.get("archived") === "true";
  const rows = await sql`
    select * from disciplines where archived = ${archivedOnly}
    order by ${archivedOnly ? sql`archived_at desc` : sql`created_at asc`}
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const whyNote = typeof body?.why_note === "string" ? body.why_note.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!whyNote) {
    return NextResponse.json({ error: "Why is required" }, { status: 400 });
  }

  // null/absent means the open-ended ladder. Anything else has to be a
  // whole number of days in range - reject junk rather than coercing it,
  // so a bad value can't quietly become a challenge nobody can finish.
  let goalDays: number | null = null;
  if (body?.goal_days !== null && body?.goal_days !== undefined) {
    const n = Number(body.goal_days);
    if (!Number.isInteger(n) || n < 1 || n > 365) {
      return NextResponse.json(
        { error: "Challenge length must be a whole number between 1 and 365 days" },
        { status: 400 }
      );
    }
    goalDays = n;
  }

  const [row] = await sql`
    insert into disciplines (name, why_note, goal_days)
    values (${name}, ${whyNote}, ${goalDays})
    returning *
  `;
  return NextResponse.json(row, { status: 201 });
}
