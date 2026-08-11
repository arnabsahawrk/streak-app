"use client";

import { useState } from "react";

export default function ConfirmDialog({
  streak,
  busy,
  onCancel,
  onConfirm,
}: {
  streak: number;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-1">Reset this streak?</h2>
        <p className="text-paper-dim text-sm mb-4">
          Day {streak} ends here.{" "}
          {streak > 0 ? "It's saved as your best if it's a new one." : ""}
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What happened? (optional, just for you)"
          rows={2}
          className="w-full bg-ash border border-ember-line rounded-lg px-3 py-2.5 mb-4 resize-none focus:outline-none focus:border-flame text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-ember-line text-paper-dim py-2.5 text-sm"
          >
            Never mind
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={busy}
            className="flex-1 rounded-lg bg-red-500/90 text-ash font-semibold py-2.5 text-sm disabled:opacity-40"
          >
            {busy ? "Resetting…" : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}
