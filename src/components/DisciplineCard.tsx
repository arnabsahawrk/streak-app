"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import type { Discipline } from "@/types";
import { currentStreakDays } from "@/lib/streak";
import { getTier, nextTier, TIERS } from "@/lib/tiers";
import { formatDate } from "@/lib/format";
import StreakCounter from "./StreakCounter";
import ConfirmDialog from "./ConfirmDialog";
import ArchiveConfirmDialog from "./ArchiveConfirmDialog";
import ResetHistoryModal from "./ResetHistoryModal";
import ShareCardModal from "./ShareCardModal";

export default function DisciplineCard({
  discipline,
  onChange,
}: {
  discipline: Discipline;
  onChange: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [pulse, setPulse] = useState(false);

  const days = currentStreakDays(discipline.start_date);
  const tier = getTier(days);
  const upNext = nextTier(days);
  const bestSoFar = Math.max(discipline.max_streak, days);

  const justHitMilestone = useMemo(
    () => TIERS.some((t) => t.min === days && days > 0),
    [days]
  );

  useEffect(() => {
    if (!justHitMilestone) return;
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.7 },
      colors: [tier.color, "#EFE9DE"],
    });
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 900);
    return () => clearTimeout(t);
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
    setArchiving(true);
    await fetch(`/api/disciplines/${discipline.id}/archive`, { method: "POST" });
    setArchiving(false);
    setArchiveOpen(false);
    onChange();
  }

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.025, 1] } : { scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative rounded-2xl bg-ash-raised border border-ember-line pl-5 pr-4 py-4"
      style={{ boxShadow: `inset 3px 0 0 0 ${tier.color}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{discipline.name}</p>
          <p className="text-paper-dim text-xs mt-0.5">{discipline.why_note}</p>
          <p className="text-paper-dim text-[11px] mt-1">
            started {formatDate(discipline.start_date)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <AnimatePresence mode="wait">
            <motion.span
              key={tier.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              className="text-[11px] font-mono uppercase tracking-wide px-2 py-1 rounded-full"
              style={{ color: tier.color, backgroundColor: `${tier.color}1A` }}
            >
              {tier.name}
            </motion.span>
          </AnimatePresence>
          <div className="flex gap-2.5 text-[11px] text-paper-dim">
            {discipline.reset_count > 0 && (
              <button onClick={() => setHistoryOpen(true)} className="hover:text-paper transition-colors">
                History
              </button>
            )}
            <button onClick={() => setShareOpen(true)} className="hover:text-paper transition-colors">
              Share
            </button>
            <button onClick={() => setArchiveOpen(true)} className="hover:text-paper transition-colors">
              Archive
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 gap-3">
        <div className="min-w-0">
          <StreakCounter value={days} color={tier.color} />
          <AnimatePresence mode="wait">
            <motion.p
              key={tier.line}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-paper text-sm font-bold mt-1"
            >
              {tier.line}
            </motion.p>
          </AnimatePresence>
          <p className="text-paper-dim text-xs mt-1">
            (Max streak: {bestSoFar} {bestSoFar === 1 ? "day" : "days"})
            {upNext && (
              <>
                {" "}
                ({upNext.min - days} {upNext.min - days === 1 ? "day" : "days"} to {upNext.name})
              </>
            )}
            {!upNext && " (maxed the ladder)"}
          </p>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="text-xs text-paper-dim hover:text-red-400 transition-colors px-2 py-1 shrink-0"
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
      {archiveOpen && (
        <ArchiveConfirmDialog
          name={discipline.name}
          busy={archiving}
          onCancel={() => setArchiveOpen(false)}
          onConfirm={handleArchive}
        />
      )}
      {historyOpen && (
        <ResetHistoryModal
          disciplineId={discipline.id}
          disciplineName={discipline.name}
          onClose={() => setHistoryOpen(false)}
        />
      )}
      {shareOpen && (
        <ShareCardModal discipline={discipline} onClose={() => setShareOpen(false)} />
      )}
    </motion.div>
  );
}
