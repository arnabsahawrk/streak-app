// Uses the Web Crypto API (available in both the Node and Edge runtimes)
// so this works identically in middleware and in API routes.
export async function hashPasscode(passcode: string): Promise<string> {
  const data = new TextEncoder().encode(`streak-app:${passcode}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const SESSION_COOKIE = "streak_session";
