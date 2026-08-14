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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/disciplines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        why_note: why.trim() || undefined,
      }),
    });
    setSaving(false);
    onCreated();
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
          placeholder="Name it plainly"
          className="w-full bg-ash border border-ember-line rounded-lg px-3 py-2.5 mb-4 focus:outline-none focus:border-flame"
        />

        <label className="block text-xs text-paper-dim mb-1.5">
          Why (optional, shown on the card)
        </label>
        <textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          rows={2}
          className="w-full bg-ash border border-ember-line rounded-lg px-3 py-2.5 mb-6 resize-none focus:outline-none focus:border-flame"
        />

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
            disabled={saving || !name.trim()}
            className="flex-1 rounded-lg bg-flame text-ash font-semibold py-2.5 text-sm disabled:opacity-40"
          >
            {saving ? "Adding…" : "Start the streak"}
          </button>
        </div>
      </form>
    </div>
  );
}
