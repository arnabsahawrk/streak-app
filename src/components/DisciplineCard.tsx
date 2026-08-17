"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { History, Share2, Archive as ArchiveIcon } from "lucide-react";
import type { Discipline } from "@/types";
import { currentStreakDays } from "@/lib/streak";
import { getTier, nextTier, TIERS } from "@/lib/tiers";
import { formatDate, dayWord } from "@/lib/format";
import StreakCounter from "./StreakCounter";
import ProgressRing from "./ProgressRing";
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
  const [error, setError] = useState<string | null>(null);

  const days = currentStreakDays(discipline.start_date);
  const tier = getTier(days);
  const upNext = nextTier(days);
  const bestSoFar = Math.max(discipline.max_streak, days);
  const progress = upNext ? (days - tier.min) / (upNext.min - tier.min) : 1;

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
    setError(null);
    try {
      const res = await fetch(`/api/disciplines/${discipline.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error();
      setConfirmOpen(false);
      onChange();
    } catch {
      setError("Couldn't reset — check your connection and try again.");
    } finally {
      setResetting(false);
    }
  }

  async function handleArchive() {
    setArchiving(true);
    setError(null);
    try {
      const res = await fetch(`/api/disciplines/${discipline.id}/archive`, { method: "POST" });
      if (!res.ok) throw new Error();
      setArchiveOpen(false);
      onChange();
    } catch {
      setError("Couldn't archive — check your connection and try again.");
    } finally {
      setArchiving(false);
    }
  }

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-ash-raised border border-ember-line px-6 pt-6 pb-5"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${tier.color}1F, transparent 65%)`,
        }}
        aria-hidden
      />

      <div className="relative flex flex-col items-center text-center">
        <p className="text-lg font-semibold break-words">{discipline.name}</p>
        <p className="text-paper-dim text-xs mt-1 break-words max-w-xs">{discipline.why_note}</p>

        <div className="mt-5">
          <ProgressRing progress={progress} color={tier.color}>
            <StreakCounter value={days} color={tier.color} />
          </ProgressRing>
        </div>

        <AnimatePresence mode="wait">
          <motion.span
            key={tier.name}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25 }}
            className="mt-4 text-[11px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full"
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
            className="text-paper text-sm font-bold mt-2 max-w-xs"
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

        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-5 rounded-full bg-ash border border-ember-line px-6 py-2 text-sm font-medium hover:border-red-400/50 hover:text-red-400 transition-colors"
        >
          Reset
        </button>

        <div className="w-full border-t border-ember-line mt-5 pt-3 flex items-center justify-between">
          <span className="text-paper-dim text-[11px]">
            started {formatDate(discipline.start_date)}
          </span>
          <div className="flex items-center gap-3 text-paper-dim">
            {discipline.reset_count > 0 && (
              <button
                onClick={() => setHistoryOpen(true)}
                aria-label="History"
                title="History"
                className="hover:text-paper transition-colors"
              >
                <History size={15} strokeWidth={2} />
              </button>
            )}
            <button
              onClick={() => setShareOpen(true)}
              aria-label="Share"
              title="Share"
              className="hover:text-paper transition-colors"
            >
              <Share2 size={15} strokeWidth={2} />
            </button>
            <button
              onClick={() => setArchiveOpen(true)}
              aria-label="Archive"
              title="Archive"
              className="hover:text-paper transition-colors"
            >
              <ArchiveIcon size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
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
