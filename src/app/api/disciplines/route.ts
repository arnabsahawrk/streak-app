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

  const [row] = await sql`
    insert into disciplines (name, why_note)
    values (${name}, ${whyNote})
    returning *
  `;
  return NextResponse.json(row, { status: 201 });
}
