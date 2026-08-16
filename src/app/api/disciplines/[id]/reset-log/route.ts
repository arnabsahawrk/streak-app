import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await sql`
    select id, streak_reached, note, run_start, reset_at
    from reset_log
    where discipline_id = ${id}
    order by reset_at desc
  `;
  return NextResponse.json(rows);
}
