"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    setLoading(false);
    if (res.ok) {
      router.replace(searchParams.get("next") || "/");
      router.refresh();
    } else {
      setError(true);
      setPasscode("");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <p className="font-mono text-xs tracking-[0.2em] text-paper-dim uppercase mb-3">
          Locked
        </p>
        <h1 className="text-2xl font-semibold mb-6">Enter your passcode</h1>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="w-full bg-ash-raised border border-ember-line rounded-lg px-4 py-3 font-mono text-lg tracking-widest focus:outline-none focus:border-flame"
          placeholder="••••"
        />
        {error && (
          <p className="text-sm text-red-400 mt-2">That&apos;s not it. Try again.</p>
        )}
        <button
          type="submit"
          disabled={loading || !passcode}
          className="mt-4 w-full bg-flame text-ash font-semibold rounded-lg py-3 disabled:opacity-40"
        >
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
