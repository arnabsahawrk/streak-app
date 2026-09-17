import { NextResponse, type NextRequest } from "next/server";

/** Cheap edge-side gate: redirects anyone without a session cookie to the
 *  sign-in page so protected pages never flash. This is not the security
 *  boundary - every page and API route revalidates the session on the
 *  server, where the cookie can actually be verified. */
const PUBLIC = ["/signin", "/api/auth", "/api/badge", "/api/cron", "/manifest.webmanifest", "/robots.txt", "/icons"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const hasSession =
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token");

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
