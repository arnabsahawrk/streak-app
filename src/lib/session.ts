import { headers } from "next/headers";
import { auth } from "@/auth";
import sql from "@/lib/db";
import type { UserSettings } from "@/lib/types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

/** Real server-side session check. Every API route and page calls this;
 *  middleware only does a cheap cookie-presence check for speed, so this
 *  is the actual security boundary. */
export async function getUser(): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
    const u = session.user;
    return {
      id: u.id,
      name: u.name ?? "",
      email: u.email ?? "",
      image: u.image ?? null,
    };
  } catch {
    return null;
  }
}

/** Reads settings, creating the row on first access so every signed-in
 *  user always has exactly one. */
export async function getSettings(userId: string): Promise<UserSettings> {
  const [row] = await sql`
    insert into user_settings (user_id) values (${userId})
    on conflict (user_id) do update set updated_at = now()
    returning *
  `;
  return {
    display_name: row.display_name,
    date_of_birth: row.date_of_birth
      ? new Date(row.date_of_birth).toISOString().slice(0, 10)
      : null,
    email_milestones: row.email_milestones,
    email_weekly: row.email_weekly,
    timezone: row.timezone,
    commitment_url: row.commitment_url,
    commitment_label: row.commitment_label,
    has_passcode: !!row.passcode_hash,
  };
}

export const PASSCODE_COOKIE = "sm_unlocked";

export async function hashPasscode(passcode: string): Promise<string> {
  const data = new TextEncoder().encode(`streakment:${passcode}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
