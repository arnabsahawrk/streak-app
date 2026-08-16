"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import type { Discipline } from "@/types";
import { currentStreakDays } from "@/lib/streak";
import { getTier, nextTier, TIERS } from "@/lib/tiers";
import { formatDate, dayWord } from "@/lib/format";
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
      origin: { y: 0.6 },
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
      animate={pulse ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-ash-raised border border-ember-line px-6 pt-5 pb-6 text-center"
      style={{ boxShadow: `inset 0 3px 0 0 ${tier.color}` }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 38%, ${tier.color}1F, transparent 65%)`,
        }}
        aria-hidden
      />

      <div className="relative">
        <p className="text-lg font-semibold break-words">{discipline.name}</p>
        <p className="text-paper-dim text-xs mt-1 break-words">{discipline.why_note}</p>

        <div className="mt-5">
          <StreakCounter value={days} color={tier.color} />
        </div>

        <AnimatePresence mode="wait">
          <motion.span
            key={tier.name}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25 }}
            className="inline-block mt-3 text-[11px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{ color: tier.color, backgroundColor: `${tier.color}1A` }}
          >
            {tier.name}
          </motion.span>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={tier.line}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-paper text-sm font-bold mt-2"
          >
            {tier.line}
          </motion.p>
        </AnimatePresence>

        <p className="text-paper-dim text-xs mt-3">
          (Max streak: {bestSoFar} {dayWord(bestSoFar)})
          {upNext && (
            <> ({upNext.min - days} {dayWord(upNext.min - days)} to {upNext.name})</>
          )}
          {!upNext && " (maxed the ladder)"}
        </p>

        <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-paper-dim mt-4">
          <span>started {formatDate(discipline.start_date)}</span>
          {discipline.reset_count > 0 && (
            <>
              <span>·</span>
              <button onClick={() => setHistoryOpen(true)} className="hover:text-paper transition-colors">
                History
              </button>
            </>
          )}
          <span>·</span>
          <button onClick={() => setShareOpen(true)} className="hover:text-paper transition-colors">
            Share
          </button>
          <span>·</span>
          <button onClick={() => setArchiveOpen(true)} className="hover:text-paper transition-colors">
            Archive
          </button>
        </div>

        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-4 rounded-full border border-ember-line px-5 py-1.5 text-xs text-paper-dim hover:text-red-400 hover:border-red-400/40 transition-colors"
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
