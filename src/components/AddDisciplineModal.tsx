"use client";

import { useState, type FormEvent } from "react";
import { CHALLENGE_PRESETS, MAX_GOAL_DAYS } from "@/lib/progress";

type Mode = "path" | "challenge";

export default function AddDisciplineModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [mode, setMode] = useState<Mode>("path");
  const [goalDays, setGoalDays] = useState<string>("3");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goalNum = Number(goalDays);
  const goalValid =
    mode === "path" ||
    (Number.isInteger(goalNum) && goalNum >= 1 && goalNum <= MAX_GOAL_DAYS);
  const canSubmit =
    name.trim().length > 0 && why.trim().length > 0 && goalValid;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/disciplines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          why_note: why.trim(),
          goal_days: mode === "challenge" ? goalNum : null,
        }),
      });
      if (!res.ok) throw new Error();
      onCreated();
    } catch {
      setError("Couldn't save — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <h2 className="text-lg font-semibold mb-4">New commitment</h2>

        <label className="block text-xs text-paper-dim mb-1.5">
          What are you committing to
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. No phone after 10pm"
          required
          className="w-full bg-ash border border-ember-line rounded-lg px-3 py-2.5 mb-4 focus:outline-none focus:border-flame"
        />

        <label className="block text-xs text-paper-dim mb-1.5">Why</label>
        <textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          rows={3}
          required
          placeholder="e.g. I keep losing hours to it right before bed"
          className="w-full bg-ash border border-ember-line rounded-lg px-3 py-2.5 mb-5 resize-none focus:outline-none focus:border-flame"
        />

        <label className="block text-xs text-paper-dim mb-2">
          What kind of commitment
        </label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setMode("path")}
            className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
              mode === "path"
                ? "border-flame bg-flame/10"
                : "border-ember-line hover:border-paper-dim"
            }`}
          >
            <span className="block text-sm font-medium">The path</span>
            <span className="block text-paper-dim text-[11px] mt-0.5 leading-snug">
              No end date. Climb toward Legend.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("challenge")}
            className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
              mode === "challenge"
                ? "border-flame bg-flame/10"
                : "border-ember-line hover:border-paper-dim"
            }`}
          >
            <span className="block text-sm font-medium">A challenge</span>
            <span className="block text-paper-dim text-[11px] mt-0.5 leading-snug">
              Fixed length. Done when you reach it.
            </span>
          </button>
        </div>

        {mode === "challenge" && (
          <div className="mb-5">
            <div className="flex gap-2 mb-2">
              {CHALLENGE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setGoalDays(String(p))}
                  className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
                    goalNum === p
                      ? "border-flame text-paper"
                      : "border-ember-line text-paper-dim hover:border-paper-dim"
                  }`}
                >
                  {p}d
                </button>
              ))}
            </div>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_GOAL_DAYS}
              value={goalDays}
              onChange={(e) => setGoalDays(e.target.value)}
              aria-label="Challenge length in days"
              className="w-full bg-ash border border-ember-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-flame"
            />
            {!goalValid && (
              <p className="text-red-400 text-[11px] mt-1.5">
                Pick a whole number of days between 1 and {MAX_GOAL_DAYS}.
              </p>
            )}
          </div>
        )}

        {mode === "path" && <div className="mb-5" />}

        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-ember-line text-paper-dim py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !canSubmit}
            className="flex-1 rounded-lg bg-flame text-ash font-semibold py-2.5 text-sm disabled:opacity-40"
          >
            {saving ? "Adding…" : "Start the streak"}
          </button>
        </div>
      </form>
    </div>
  );
}
