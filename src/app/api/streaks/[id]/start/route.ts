import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getUser } from "@/lib/session";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [row] = await sql`
    update disciplines set start_date = now()
    where id = ${id} and user_id = ${user.id} and archived = false
    returning *
  `;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
