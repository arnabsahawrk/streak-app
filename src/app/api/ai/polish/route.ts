import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { groq, POLISH_SYSTEM } from "@/lib/ai";
import { LIMITS, clamp } from "@/lib/limits";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = clamp(body?.text, LIMITS.chat);
  if (!text) return NextResponse.json({ error: "Nothing to polish" }, { status: 400 });

  const out = await groq(POLISH_SYSTEM, text, 900);
  if (!out) {
    return NextResponse.json(
      { error: "The polish service is unavailable right now — your text is unchanged." },
      { status: 503 }
    );
  }
  return NextResponse.json({ text: out.slice(0, LIMITS.chat) });
}
