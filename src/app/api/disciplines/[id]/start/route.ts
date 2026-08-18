import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [updated] = await sql`
    update disciplines set start_date = now() where id = ${id} returning *
  `;
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
