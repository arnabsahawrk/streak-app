"use client";

import { useState } from "react";

export default function ArchiveConfirmDialog({
  name,
  busy,
  onCancel,
  onConfirm,
}: {
  name: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === name;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-1">Archive this commitment?</h2>
        <p className="text-paper-dim text-sm mb-4">
          It stops counting and moves to Archive history — nothing is deleted, and
          you can restore it later. To confirm, type its name:
        </p>
        <p className="font-mono text-sm mb-2 text-paper">{name}</p>
        <input
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Type the name exactly"
          className="w-full bg-ash border border-ember-line rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:border-flame"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-ember-line text-paper-dim py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!matches || busy}
            className="flex-1 rounded-lg bg-red-500/90 text-ash font-semibold py-2.5 text-sm disabled:opacity-40"
          >
            {busy ? "Archiving…" : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
