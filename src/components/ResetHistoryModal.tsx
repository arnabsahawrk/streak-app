"use client";

import { useEffect, useState } from "react";
import { formatDate, dayWord } from "@/lib/format";
import type { ResetEntry } from "@/types";

export default function ResetHistoryModal({
  disciplineId,
  disciplineName,
  onClose,
}: {
  disciplineId: string;
  disciplineName: string;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<ResetEntry[] | null>(null);

  useEffect(() => {
    fetch(`/api/disciplines/${disciplineId}/reset-log`)
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [disciplineId]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold break-words pr-3">{disciplineName}</h2>
          <button onClick={onClose} className="text-paper-dim text-sm shrink-0">
            Close
          </button>
        </div>

        {entries === null ? (
          <p className="text-paper-dim text-sm">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-paper-dim text-sm">
            No resets yet — this one hasn&apos;t broken since it started.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((e) => (
              <li key={e.id} className="border-b border-ember-line pb-3 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="font-mono text-sm">
                    {e.streak_reached} {dayWord(e.streak_reached)}
                  </span>
                  <span className="text-paper-dim text-xs">
                    {formatDate(e.run_start)} to {formatDate(e.reset_at)}
                  </span>
                </div>
                {e.note && <p className="text-paper-dim text-xs mt-1 break-words">{e.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
