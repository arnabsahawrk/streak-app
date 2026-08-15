"use client";

import { useEffect, useState } from "react";
import type { Discipline } from "@/types";
import { currentStreakDays } from "@/lib/streak";
import { formatDate, dayWord } from "@/lib/format";

export default function ArchiveHistoryModal({
  onClose,
  onRestored,
}: {
  onClose: () => void;
  onRestored: () => void;
}) {
  const [items, setItems] = useState<Discipline[] | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/disciplines?archived=true")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  async function restore(id: string) {
    setRestoringId(id);
    await fetch(`/api/disciplines/${id}/restore`, { method: "POST" });
    setRestoringId(null);
    setItems((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
    onRestored();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Archive history</h2>
          <button onClick={onClose} className="text-paper-dim text-sm">
            Close
          </button>
        </div>

        {items === null ? (
          <p className="text-paper-dim text-sm">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-paper-dim text-sm">
            Nothing archived. Archived commitments end up here instead of being
            deleted — frozen, not erased.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((d) => {
              const frozenDays = d.archived_at
                ? currentStreakDays(d.start_date, d.archived_at)
                : 0;
              return (
                <li key={d.id} className="border-b border-ember-line pb-4 last:border-0 last:pb-0">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-paper-dim text-xs mt-0.5">{d.why_note}</p>
                  <p className="text-paper-dim text-xs mt-1.5">
                    Reached {frozenDays} {dayWord(frozenDays)} · archived{" "}
                    {d.archived_at ? formatDate(d.archived_at) : "—"}
                  </p>
                  <button
                    onClick={() => restore(d.id)}
                    disabled={restoringId === d.id}
                    className="mt-2 text-xs text-flame hover:text-paper transition-colors disabled:opacity-40"
                  >
                    {restoringId === d.id ? "Restoring…" : "Restore — start fresh"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
