"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

interface ResetEntry {
  id: string;
  streak_reached: number;
  note: string | null;
  reset_at: string;
}

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
      <div className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold truncate pr-3">{disciplineName}</h2>
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
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-sm">
                    {e.streak_reached} {e.streak_reached === 1 ? "day" : "days"}
                  </span>
                  <span className="text-paper-dim text-xs shrink-0">
                    {formatDate(e.reset_at)}
                  </span>
                </div>
                {e.note && <p className="text-paper-dim text-xs mt-1">{e.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
