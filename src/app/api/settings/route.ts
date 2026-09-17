import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getUser, getSettings } from "@/lib/session";
import { LIMITS, clamp } from "@/lib/limits";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getSettings(user.id));
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const fields: Record<string, unknown> = {};

  if ("display_name" in body)
    fields.display_name = clamp(body.display_name, LIMITS.displayName) || null;
  if ("date_of_birth" in body)
    fields.date_of_birth = body.date_of_birth ? String(body.date_of_birth) : null;
  if ("commitment_label" in body)
    fields.commitment_label = clamp(body.commitment_label, LIMITS.commitmentLabel) || null;
  if ("email_milestones" in body) fields.email_milestones = !!body.email_milestones;
  if ("email_weekly" in body) fields.email_weekly = !!body.email_weekly;
  if (typeof body.timezone === "string" && body.timezone.length <= 64)
    fields.timezone = body.timezone;

  if ("commitment_url" in body) {
    const raw = clamp(body.commitment_url, LIMITS.commitmentUrl);
    if (!raw) {
      fields.commitment_url = null;
    } else {
      // Only http(s). Blocks javascript: and data: URLs, which would
      // otherwise become a stored-XSS vector the moment the link renders.
      try {
        const parsed = new URL(raw);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
        fields.commitment_url = parsed.toString();
      } catch {
        return NextResponse.json(
          { error: "That doesn't look like a valid http(s) link" },
          { status: 400 }
        );
      }
    }
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  fields.updated_at = new Date();
  await sql`insert into user_settings (user_id) values (${user.id}) on conflict do nothing`;
  await sql`update user_settings set ${sql(fields)} where user_id = ${user.id}`;
  return NextResponse.json(await getSettings(user.id));
}
