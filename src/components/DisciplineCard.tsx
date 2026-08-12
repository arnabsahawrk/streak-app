"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import type { Discipline } from "@/types";
import { currentStreakDays } from "@/lib/streak";
import { getTier, nextTier, TIERS } from "@/lib/tiers";
import { formatDate } from "@/lib/format";
import StreakCounter from "./StreakCounter";
import ConfirmDialog from "./ConfirmDialog";
import ResetHistoryModal from "./ResetHistoryModal";

export default function DisciplineCard({
  discipline,
  onChange,
}: {
  discipline: Discipline;
  onChange: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const days = currentStreakDays(discipline.start_date);
  const tier = getTier(days);
  const upNext = nextTier(days);
  // Live "best": if the current run has already passed the last saved max,
  // show the current run — don't wait for a reset to update it.
  const bestSoFar = Math.max(discipline.max_streak, days);

  const justHitMilestone = useMemo(
    () => TIERS.some((t) => t.min === days && days > 0),
    [days]
  );

  useEffect(() => {
    if (!justHitMilestone) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: [tier.color, "#EFE9DE"],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justHitMilestone]);

  async function handleReset(note: string) {
    setResetting(true);
    await fetch(`/api/disciplines/${discipline.id}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setResetting(false);
    setConfirmOpen(false);
    onChange();
  }

  async function handleArchive() {
    if (!confirm(`Archive "${discipline.name}"? You can't undo this from the app.`)) return;
    await fetch(`/api/disciplines/${discipline.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: true }),
    });
    onChange();
  }

  return (
    <div
      className="relative rounded-2xl bg-ash-raised border border-ember-line pl-5 pr-4 py-4"
      style={{ boxShadow: `inset 3px 0 0 0 ${tier.color}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-2">
          <span
            className="mt-1.5 h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: discipline.color }}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-medium truncate">{discipline.name}</p>
            {discipline.why_note && (
              <p className="text-paper-dim text-xs mt-0.5 truncate">{discipline.why_note}</p>
            )}
            <p className="text-paper-dim text-[11px] mt-1">
              started {formatDate(discipline.start_date)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className="text-[11px] font-mono uppercase tracking-wide px-2 py-1 rounded-full"
            style={{ color: tier.color, backgroundColor: `${tier.color}1A` }}
          >
            {tier.name}
          </span>
          <div className="flex gap-2.5 text-[11px] text-paper-dim">
            <button onClick={() => setHistoryOpen(true)} className="hover:text-paper transition-colors">
              History
            </button>
            <button onClick={handleArchive} className="hover:text-paper transition-colors">
              Archive
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <StreakCounter value={days} color={tier.color} />
          <p className="text-paper-dim text-xs mt-1">
            Max streak: {bestSoFar} {bestSoFar === 1 ? "day" : "days"}
            {upNext
              ? ` · ${upNext.min - days} ${upNext.min - days === 1 ? "day" : "days"} to ${upNext.name}`
              : " · maxed the ladder"}
          </p>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="text-xs text-paper-dim hover:text-red-400 transition-colors px-2 py-1"
        >
          Reset
        </button>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          streak={days}
          busy={resetting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleReset}
        />
      )}

      {historyOpen && (
        <ResetHistoryModal
          disciplineId={discipline.id}
          disciplineName={discipline.name}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
}
