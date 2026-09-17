import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getUser, hashPasscode, PASSCODE_COOKIE } from "@/lib/session";

/** The passcode is a second lock on top of Google sign-in, for shared or
 *  borrowed devices. Setting it stores a SHA-256 hash; unlocking sets a
 *  session cookie that dies with the browser, so it's asked for again on
 *  each new session. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action;
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  if (action === "set") {
    if (passcode.length < 4 || passcode.length > 64) {
      return NextResponse.json({ error: "Use at least 4 characters" }, { status: 400 });
    }
    const hash = await hashPasscode(passcode);
    await sql`insert into user_settings (user_id) values (${user.id}) on conflict do nothing`;
    await sql`update user_settings set passcode_hash = ${hash}, updated_at = now() where user_id = ${user.id}`;
    const res = NextResponse.json({ ok: true });
    res.cookies.set(PASSCODE_COOKIE, hash, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    return res;
  }

  if (action === "remove") {
    const [row] = await sql`select passcode_hash from user_settings where user_id = ${user.id}`;
    if (row?.passcode_hash && row.passcode_hash !== (await hashPasscode(passcode))) {
      return NextResponse.json({ error: "That passcode isn't right" }, { status: 401 });
    }
    await sql`update user_settings set passcode_hash = null, updated_at = now() where user_id = ${user.id}`;
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(PASSCODE_COOKIE);
    return res;
  }

  if (action === "unlock") {
    const [row] = await sql`select passcode_hash from user_settings where user_id = ${user.id}`;
    const hash = await hashPasscode(passcode);
    if (!row?.passcode_hash || row.passcode_hash !== hash) {
      return NextResponse.json({ error: "That passcode isn't right" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(PASSCODE_COOKIE, hash, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    return res;
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
