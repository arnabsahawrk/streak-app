import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getUser } from "@/lib/session";
import { LIMITS, clamp } from "@/lib/limits";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const fields: Record<string, unknown> = {};
  if (typeof body.name === "string") {
    const v = clamp(body.name, LIMITS.name);
    if (v) fields.name = v;
  }
  if (typeof body.why_note === "string") {
    const v = clamp(body.why_note, LIMITS.why);
    if (v) fields.why_note = v;
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [row] = await sql`
    update disciplines set ${sql(fields)}
    where id = ${id} and user_id = ${user.id}
    returning *
  `;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
