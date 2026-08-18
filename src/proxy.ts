import { NextResponse, type NextRequest } from "next/server";
import { hashPasscode, SESSION_COOKIE } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/login",
  "/api/login",
  "/manifest.webmanifest",
  "/sw.js",
  "/api/badge",
  "/unsupported.html",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith("/icons")) {
    return NextResponse.next();
  }

  const passcode = process.env.APP_PASSCODE;
  if (!passcode) {
    // No passcode configured yet — stay open rather than lock the owner
    // out during local setup. Set APP_PASSCODE before deploying.
    return NextResponse.next();
  }

  const expected = await hashPasscode(passcode);
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;

  if (cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons).*)"],
};
