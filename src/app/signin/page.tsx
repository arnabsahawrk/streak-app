"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      await signIn.social({ provider: "google", callbackURL: "/" });
    } catch {
      setErr("Couldn't reach Google just then. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={72}
          height={72}
          className="mx-auto mb-5 rounded-2xl"
          priority
        />
        <h1 className="text-2xl font-bold tracking-tight">STREAKMENT</h1>
        <p className="mt-1.5 text-sm text-flame">Keep the commitment alive.</p>

        <p className="prose-justify mt-6 text-sm text-paper-dim">
          Track the things you&apos;ve promised yourself. Watch the days stack up through
          ten milestones, write down what trips you, and keep the whole record.
        </p>

        <button
          onClick={go}
          disabled={busy}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-paper py-3 font-semibold text-ash transition-transform active:scale-95 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2 5.1-4.4 6.7v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.2z"/>
            <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46z"/>
            <path fill="#FBBC05" d="M11.8 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-3 .7-4.3v-5.7H4.5C2.9 17.2 2 20.5 2 24s.9 6.8 2.5 10l7.3-5.7z"/>
            <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14l7.3 5.7c1.7-5.2 6.5-8.9 12.2-8.9z"/>
          </svg>
          {busy ? "Opening Google…" : "Continue with Google"}
        </button>

        {err && <p className="mt-3 text-xs text-red-400">{err}</p>}

        <p className="mt-8 text-[11px] text-paper-dim">
          Free, ad-free, and yours. Your streaks are visible only to you.
        </p>
      </div>
    </main>
  );
}
