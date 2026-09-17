"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import DetailSheet from "./DetailSheet";
import { currentStreakDays } from "@/lib/streak";
import { formatDate, dayWord } from "@/lib/format";
import type { Streak } from "@/lib/types";

/** Everything the app knows about a finished commitment, kept rather than
 *  discarded: what it was, why it started, how far it got, how often it
 *  broke, and how it ended. */
export default function ArchiveSheet({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Streak[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/streaks?archived=true")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]));
  }, []);

  return (
    <>
      <Modal title="Archive" onClose={onClose} wide>
        {items === null ? (
          <p className="text-sm text-paper-dim">Loading…</p>
        ) : items.length === 0 ? (
          <p className="prose-justify text-sm text-paper-dim">
            Nothing archived yet. When you finish a commitment it lands here with its
            whole story attached.
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {items.map((s) => {
              const isSprint = s.kind === "sprint" && !!s.goal_days;
              const finalRun = s.archived_at
                ? currentStreakDays(s.start_date, s.archived_at)
                : 0;
              return (
                <li key={s.id} className="rounded-xl border border-ember-line bg-ash p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="break-words font-semibold">{s.name}</h3>
                    <span className="shrink-0 rounded-full border border-ember-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-paper-dim">
                      {isSprint ? `${s.goal_days}-day sprint` : "ascent"}
                    </span>
                  </div>

                  <p className="prose-justify mt-1.5 text-xs text-paper-dim">{s.why_note}</p>

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-paper-dim">Started</dt>
                      <dd>{formatDate(s.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-paper-dim">Archived</dt>
                      <dd>{s.archived_at ? formatDate(s.archived_at) : "—"}</dd>
                    </div>
                    {!isSprint && (
                      <div>
                        <dt className="text-[10px] uppercase tracking-wide text-paper-dim">Best run</dt>
                        <dd>{s.max_streak} {dayWord(s.max_streak)}</dd>
                      </div>
                    )}
                    {isSprint && (
                      <div>
                        <dt className="text-[10px] uppercase tracking-wide text-paper-dim">Final run</dt>
                        <dd>
                          {finalRun} {dayWord(finalRun)}
                          {finalRun >= (s.goal_days ?? 0) ? " · completed" : " · unfinished"}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-paper-dim">Times reset</dt>
                      <dd>{s.reset_count}</dd>
                    </div>
                  </dl>

                  {s.archive_reason && (
                    <div className="mt-3 border-t border-ember-line pt-3">
                      <p className="text-[10px] uppercase tracking-wide text-paper-dim">Closing note</p>
                      <p className="prose-justify mt-1 text-xs text-paper">{s.archive_reason}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setOpenId(s.id)}
                    className="mt-3 text-[11px] text-flame hover:text-paper"
                  >
                    Open its journal and full history →
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>

      {openId && (
        <DetailSheet streakId={openId} onClose={() => setOpenId(null)} onChanged={() => {}} />
      )}
    </>
  );
}
