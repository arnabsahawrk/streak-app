"use client";

import { motion } from "motion/react";
import type { Discipline } from "@/types";
import { TIERS, ZERO_STATE, type Tier } from "@/lib/tiers";
import { viewOf, GOLD, NEUTRAL } from "@/lib/progress";
import { dayWord } from "@/lib/format";

const STEPS: Tier[] = [ZERO_STATE, ...TIERS];

/** Index of the furthest step reached. -1 while paused (nothing lit yet). */
function reachedIndex(days: number, paused: boolean): number {
  if (paused) return -1;
  let idx = 0;
  STEPS.forEach((s, i) => {
    if (days >= s.min) idx = i;
  });
  return idx;
}

function LadderPath({ days, paused }: { days: number; paused: boolean }) {
  const current = reachedIndex(days, paused);

  return (
    <ul className="flex flex-col">
      {STEPS.map((step, i) => {
        const reached = i <= current;
        const isCurrent = i === current;
        const nextReached = i + 1 <= current;
        const isLast = i === STEPS.length - 1;

        return (
          <li key={step.name} className="flex gap-4">
            <div className="flex flex-col items-center self-stretch shrink-0">
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="mt-1 h-3.5 w-3.5 rounded-full border-2 shrink-0"
                style={{
                  backgroundColor: reached ? step.color : "transparent",
                  borderColor: reached ? step.color : "#2a241c",
                  boxShadow: isCurrent ? `0 0 0 4px ${step.color}33` : undefined,
                }}
              />
              {!isLast && (
                <motion.span
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
                  className="w-0.5 flex-1 my-1 rounded-full"
                  style={{
                    transformOrigin: "top",
                    backgroundColor: nextReached ? STEPS[i + 1].color : "#2a241c",
                  }}
                />
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={isLast ? "pb-1" : "pb-6"}
            >
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-sm font-semibold"
                  style={{ color: reached ? step.color : "#6b6358" }}
                >
                  {step.name}
                </span>
                <span className="text-paper-dim text-[11px] font-mono">
                  {step.min === 0 ? "start" : `day ${step.min}`}
                </span>
                {isCurrent && (
                  <span
                    className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{ color: step.color, backgroundColor: `${step.color}1A` }}
                  >
                    you are here
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-1 break-words ${
                  reached ? "text-paper font-medium" : "text-paper-dim"
                }`}
              >
                {step.line}
              </p>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}

function ChallengePath({
  days,
  goal,
  complete,
  paused,
}: {
  days: number;
  goal: number;
  complete: boolean;
  paused: boolean;
}) {
  const done = paused ? 0 : Math.min(days, goal);

  return (
    <div>
      <p className="text-paper-dim text-xs mb-4">
        {complete
          ? `You set ${goal} ${dayWord(goal)} and you got there.`
          : paused
            ? `Paused. ${goal} ${dayWord(goal)} from the day you start again.`
            : `${goal - done} ${dayWord(goal - done)} to go.`}
      </p>

      {goal <= 60 ? (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: goal }, (_, i) => {
            const filled = i < done;
            return (
              <motion.span
                key={i}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.6), duration: 0.25 }}
                title={`Day ${i + 1}`}
                className="h-6 w-6 rounded border flex items-center justify-center text-[10px] font-mono"
                style={{
                  backgroundColor: filled
                    ? complete
                      ? `${GOLD}33`
                      : "#2a241c"
                    : "transparent",
                  borderColor: filled ? (complete ? GOLD : "#4a4034") : "#2a241c",
                  color: filled ? (complete ? GOLD : "#efe9de") : "#6b6358",
                }}
              >
                {i + 1}
              </motion.span>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="h-2 w-full rounded-full bg-ember-line overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(done / goal) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: complete ? GOLD : "#e8703a" }}
            />
          </div>
          <p className="text-paper-dim text-[11px] mt-2 font-mono">
            {done} / {goal}
          </p>
        </div>
      )}
    </div>
  );
}

export default function PathModal({
  discipline,
  onClose,
}: {
  discipline: Discipline;
  onClose: () => void;
}) {
  const v = viewOf(discipline);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-lg font-semibold break-words">
            {v.isSprint ? "Challenge" : "The path"}
          </h2>
          <button onClick={onClose} className="text-paper-dim text-sm shrink-0">
            Close
          </button>
        </div>
        <p className="text-paper-dim text-xs mb-5 break-words">{discipline.name}</p>

        {v.isSprint && v.goalDays ? (
          <ChallengePath
            days={v.days}
            goal={v.goalDays}
            complete={v.isFinished}
            paused={v.isPaused}
          />
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-5">
              <span
                className="font-mono text-2xl font-bold"
                style={{ color: v.isPaused ? NEUTRAL : v.color }}
              >
                {v.isPaused ? "—" : v.days}
              </span>
              <span className="text-paper-dim text-xs">
                {v.isPaused
                  ? "paused — nothing lit yet"
                  : v.upNext
                    ? `${dayWord(v.days)} in · ${v.upNext.min - v.days} ${dayWord(
                        v.upNext.min - v.days
                      )} to ${v.upNext.name}`
                    : `${dayWord(v.days)} in · the whole path is behind you`}
              </span>
            </div>
            <LadderPath days={v.days} paused={v.isPaused} />
          </>
        )}
      </div>
    </div>
  );
}
