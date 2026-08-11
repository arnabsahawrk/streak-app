"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import type { Discipline } from "@/types";
import { currentStreakDays } from "@/lib/streak";
import { getTier, nextTier, TIERS } from "@/lib/tiers";
import StreakCounter from "./StreakCounter";
import ConfirmDialog from "./ConfirmDialog";

export default function DisciplineCard({
  discipline,
  onChange,
}: {
  discipline: Discipline;
  onChange: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const days = currentStreakDays(discipline.start_date);
  const tier = getTier(days);
  const upNext = nextTier(days);

  // Stateless milestone detection: if today's count lands exactly on a tier
  // threshold, today is the day it was crossed — no extra column needed to
  // remember "have I celebrated this yet".
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
    // Only re-fire if the milestone itself changes, not on every render.
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

  return (
    <div
      className="relative rounded-2xl bg-ash-raised border border-ember-line pl-5 pr-4 py-4"
      style={{ boxShadow: `inset 3px 0 0 0 ${tier.color}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{discipline.name}</p>
          {discipline.why_note && (
            <p className="text-paper-dim text-xs mt-0.5 truncate">{discipline.why_note}</p>
          )}
        </div>
        <span
          className="shrink-0 text-[11px] font-mono uppercase tracking-wide px-2 py-1 rounded-full"
          style={{ color: tier.color, backgroundColor: `${tier.color}1A` }}
        >
          {tier.name}
        </span>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <StreakCounter value={days} color={tier.color} />
          <p className="text-paper-dim text-xs mt-1">
            best {discipline.max_streak}
            {upNext ? ` · ${upNext.min - days} to ${upNext.name}` : " · maxed the ladder"}
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
    </div>
  );
}
