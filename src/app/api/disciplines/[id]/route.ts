import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const fields: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) fields.name = body.name.trim();
  if (typeof body.color === "string") fields.color = body.color;
  if (typeof body.why_note === "string") fields.why_note = body.why_note.trim() || null;
  if (typeof body.archived === "boolean") fields.archived = body.archived;

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [row] = await sql`
    update disciplines set ${sql(fields)} where id = ${id} returning *
  `;
  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await sql`delete from disciplines where id = ${id}`;
  return NextResponse.json({ ok: true });
}
