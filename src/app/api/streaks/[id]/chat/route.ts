import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getUser } from "@/lib/session";
import { LIMITS, clamp } from "@/lib/limits";

async function owns(userId: string, id: string) {
  const [row] = await sql`select id from disciplines where id = ${id} and user_id = ${userId}`;
  return !!row;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await owns(user.id, id))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rows = await sql`
    select id, body, created_at from chat_messages
    where discipline_id = ${id} order by created_at asc
  `;
  return NextResponse.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await owns(user.id, id))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const text = clamp(body?.body, LIMITS.chat);
  if (!text) return NextResponse.json({ error: "Write something first" }, { status: 400 });

  const [row] = await sql`
    insert into chat_messages (discipline_id, user_id, body)
    values (${id}, ${user.id}, ${text})
    returning id, body, created_at
  `;
  return NextResponse.json(row, { status: 201 });
}
