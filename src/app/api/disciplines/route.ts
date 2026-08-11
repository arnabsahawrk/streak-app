import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const rows = await sql`
    select * from disciplines where archived = false order by created_at asc
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const color = typeof body?.color === "string" ? body.color : "#EF4444";
  const whyNote =
    typeof body?.why_note === "string" && body.why_note.trim()
      ? body.why_note.trim()
      : null;

  const [row] = await sql`
    insert into disciplines (name, color, why_note)
    values (${name}, ${color}, ${whyNote})
    returning *
  `;
  return NextResponse.json(row, { status: 201 });
}
