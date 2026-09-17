"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

/** Tidies spelling and grammar without changing the meaning. Runs only
 *  when asked - never rewrites anything behind the user's back. */
export default function PolishButton({
  text,
  onPolished,
  disabled,
}: {
  text: string;
  onPolished: (next: string) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't polish that.");
      onPolished(data.text);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't polish that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-1 flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={disabled || busy || !text.trim()}
        className="inline-flex items-center gap-1.5 rounded-full border border-ember-line px-2.5 py-1 text-[11px] text-paper-dim transition-colors hover:border-flame hover:text-flame disabled:opacity-40"
      >
        <Sparkles size={12} /> {busy ? "Polishing…" : "Polish"}
      </button>
      {err && <span className="text-[11px] text-red-400">{err}</span>}
    </div>
  );
}
