"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { History, Share2, Archive as ArchiveIcon, Route } from "lucide-react";
import type { Discipline } from "@/types";
import { TIERS } from "@/lib/tiers";
import { viewOf, GOLD } from "@/lib/progress";
import { formatDate, dayWord } from "@/lib/format";
import StreakCounter from "./StreakCounter";
import ProgressRing from "./ProgressRing";
import ConfirmDialog from "./ConfirmDialog";
import ArchiveConfirmDialog from "./ArchiveConfirmDialog";
import ResetHistoryModal from "./ResetHistoryModal";
import ShareCardModal from "./ShareCardModal";
import PathModal from "./PathModal";

const DAY_MS = 1000 * 60 * 60 * 24;

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
  const [pathOpen, setPathOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const v = viewOf(discipline);
  const bestSoFar = Math.max(discipline.max_streak, v.days);

  // The day a finished challenge was actually met, derived rather than
  // stored - start_date is the only thing that moves, so this can't drift.
  const metOn =
    v.isComplete && discipline.start_date && v.goalDays
      ? new Date(new Date(discipline.start_date).getTime() + v.goalDays * DAY_MS)
      : null;

  // Stateless celebration: today either lands exactly on a milestone (or on
  // the challenge goal) or it doesn't, so there's no "have I already fired
  // this" flag to keep in sync.
  const justHitMilestone = useMemo(() => {
    if (v.isPaused || v.days <= 0) return false;
    if (v.isChallenge) return v.days === v.goalDays;
    return TIERS.some((t) => t.min === v.days);
  }, [v.isPaused, v.isChallenge, v.days, v.goalDays]);

  useEffect(() => {
    if (!justHitMilestone) return;
    confetti({
      particleCount: v.isComplete ? 140 : 90,
      spread: v.isComplete ? 95 : 75,
      origin: { y: 0.6 },
      colors: [v.color, "#EFE9DE"],
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

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/disciplines/${discipline.id}/start`, { method: "POST" });
      if (!res.ok) throw new Error();
      onChange();
    } catch {
      setError("Couldn't start — check your connection and try again.");
    } finally {
      setStarting(false);
    }
  }

  async function handleArchive(reason: string) {
    setArchiving(true);
    setError(null);
    try {
      const res = await fetch(`/api/disciplines/${discipline.id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
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
      style={v.isComplete ? { borderColor: `${GOLD}66` } : undefined}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${v.color}1F, transparent 65%)`,
        }}
        aria-hidden
      />

      <div className="relative flex flex-col items-center text-center">
        <p className="text-lg font-semibold break-words">{discipline.name}</p>
        <p className="text-paper-dim text-xs mt-1 break-words max-w-xs">{discipline.why_note}</p>

        <div className="mt-5">
          <ProgressRing progress={v.progress} color={v.color}>
            {v.isPaused ? (
              <div className="text-center">
                <p className="font-mono text-6xl font-bold leading-none text-paper-dim">—</p>
                <p className="text-paper-dim text-[10px] tracking-[0.25em] uppercase mt-2">
                  Paused
                </p>
              </div>
            ) : (
              <StreakCounter value={v.days} color={v.color} caption={v.caption} />
            )}
          </ProgressRing>
        </div>

        {v.pill && (
          <AnimatePresence mode="wait">
            <motion.span
              key={v.pill}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              className="mt-4 text-[11px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ color: v.color, backgroundColor: `${v.color}1A` }}
            >
              {v.pill}
            </motion.span>
          </AnimatePresence>
        )}

        <AnimatePresence mode="wait">
          <motion.p
            key={v.line}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-paper text-sm font-bold mt-2 max-w-xs"
          >
            {v.line}
          </motion.p>
        </AnimatePresence>

        <p className="text-paper-dim text-xs mt-3">
          (Max streak: {bestSoFar} {dayWord(bestSoFar)})
          {!v.isPaused && v.isChallenge && v.goalDays && !v.isComplete && (
            <>
              {" "}
              ({v.goalDays - v.days} {dayWord(v.goalDays - v.days)} to go)
            </>
          )}
          {v.isComplete && metOn && <> (met {formatDate(metOn)})</>}
          {!v.isPaused && !v.isChallenge && v.upNext && (
            <>
              {" "}
              ({v.upNext.min - v.days} {dayWord(v.upNext.min - v.days)} to {v.upNext.name})
            </>
          )}
          {!v.isPaused && !v.isChallenge && !v.upNext && " (maxed the ladder)"}
        </p>

        {v.isComplete && (
          <button
            onClick={() => setArchiveOpen(true)}
            className="mt-5 rounded-full px-7 py-2 text-sm font-semibold text-ash active:scale-95 transition-transform"
            style={{ backgroundColor: GOLD }}
          >
            Finish and archive
          </button>
        )}

        {!v.isComplete &&
          (v.isPaused ? (
            <button
              onClick={handleStart}
              disabled={starting}
              className="mt-5 rounded-full bg-flame text-ash px-7 py-2 text-sm font-semibold disabled:opacity-40 active:scale-95 transition-transform"
            >
              {starting ? "Starting…" : "Start"}
            </button>
          ) : (
            <button
              onClick={() => setConfirmOpen(true)}
              className="mt-5 rounded-full bg-ash border border-ember-line px-6 py-2 text-sm font-medium hover:border-red-400/50 hover:text-red-400 transition-colors"
            >
              Reset
            </button>
          ))}

        <div className="w-full border-t border-ember-line mt-5 pt-3 flex items-center justify-between">
          <span className="text-paper-dim text-[11px]">
            {v.isPaused ? "not started" : `started ${formatDate(discipline.start_date as string)}`}
          </span>
          <div className="flex items-center gap-3 text-paper-dim">
            <button
              onClick={() => setPathOpen(true)}
              aria-label={v.isChallenge ? "Challenge progress" : "The path"}
              title={v.isChallenge ? "Challenge progress" : "The path"}
              className="hover:text-paper transition-colors"
            >
              <Route size={15} strokeWidth={2} />
            </button>
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
          streak={v.days}
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
      {pathOpen && (
        <PathModal discipline={discipline} onClose={() => setPathOpen(false)} />
      )}
    </motion.div>
  );
}
