"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function UnlockPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/passcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unlock", passcode }),
    });
    setBusy(false);
    if (res.ok) {
      router.replace("/");
      router.refresh();
    } else {
      setErr("That passcode isn't right.");
      setPasscode("");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-xs">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-paper-dim">Locked</p>
        <h1 className="mb-6 text-2xl font-semibold">Enter your passcode</h1>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="••••"
          className="w-full rounded-lg border border-ember-line bg-ash-raised px-4 py-3 font-mono text-lg tracking-widest focus:border-flame focus:outline-none"
        />
        {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
        <button
          type="submit"
          disabled={busy || !passcode}
          className="mt-4 w-full rounded-lg bg-flame py-3 font-semibold text-ash disabled:opacity-40"
        >
          {busy ? "Checking…" : "Unlock"}
        </button>
      </form>
    </main>
  );
}
