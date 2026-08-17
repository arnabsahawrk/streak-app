"use client";

import { useState, type FormEvent } from "react";

export default function AddDisciplineModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && why.trim().length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/disciplines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), why_note: why.trim() }),
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
        className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6"
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
          className="w-full bg-ash border border-ember-line rounded-lg px-3 py-2.5 mb-6 resize-none focus:outline-none focus:border-flame"
        />

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
