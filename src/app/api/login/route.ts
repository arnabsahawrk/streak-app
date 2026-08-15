import { NextResponse } from "next/server";
import { hashPasscode, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";
  const expected = process.env.APP_PASSCODE;

  if (!expected || passcode !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await hashPasscode(passcode), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    // No maxAge: a session cookie, cleared when the browser/app fully
    // closes, so the passcode is asked for again next time it's opened.
    path: "/",
  });
  return res;
}
