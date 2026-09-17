import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUser, getSettings, PASSCODE_COOKIE } from "@/lib/session";
import sql from "@/lib/db";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

/** Real gate. Middleware only checks that a session cookie exists; this
 *  validates it server-side, then enforces the optional passcode before
 *  any streak data is fetched. */
export default async function HomePage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const settings = await getSettings(user.id);

  if (settings.has_passcode) {
    const [row] = await sql`select passcode_hash from user_settings where user_id = ${user.id}`;
    const cookie = (await cookies()).get(PASSCODE_COOKIE)?.value;
    if (row?.passcode_hash && cookie !== row.passcode_hash) redirect("/unlock");
  }

  return <Dashboard user={user} settings={settings} />;
}
