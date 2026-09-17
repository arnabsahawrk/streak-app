"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import Modal from "./Modal";
import CharCount from "./CharCount";
import PolishButton from "./PolishButton";
import Heatmap from "./Heatmap";
import { AscentRoadmap, SprintRoadmap } from "./Roadmap";
import { viewOf } from "@/lib/progress";
import { formatDate, formatDateTime, dayWord } from "@/lib/format";
import { LIMITS } from "@/lib/limits";
import type { Streak, ResetEntry, ChatMessage } from "@/lib/types";

type Tab = "path" | "journal" | "history";

export default function DetailSheet({
  streakId,
  onClose,
  onChanged,
}: {
  streakId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [data, setData] = useState<{
    streak: Streak;
    resets: ResetEntry[];
    chat: ChatMessage[];
    insight: { content: string; created_at: string } | null;
  } | null>(null);
  const [tab, setTab] = useState<Tab>("path");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [insightBusy, setInsightBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/streaks/${streakId}/detail`);
    if (res.ok) setData(await res.json());
  }, [streakId]);

  useEffect(() => { load(); }, [load]);

  async function send() {
    if (!draft.trim() || sending) return;
    setSending(true);
    setErr(null);
    try {
      const res = await fetch(`/api/streaks/${streakId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      });
      if (!res.ok) throw new Error();
      setDraft("");
      await load();
      onChanged();
    } catch {
      setErr("Couldn't save that note.");
    } finally {
      setSending(false);
    }
  }

  async function runInsight() {
    setInsightBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/ai/insight/${streakId}`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Couldn't read the patterns.");
      setData((d) => (d ? { ...d, insight: body } : d));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't read the patterns.");
    } finally {
      setInsightBusy(false);
    }
  }

  if (!data) {
    return (
      <Modal title="Loading…" onClose={onClose} wide>
        <p className="text-sm text-paper-dim">One moment.</p>
      </Modal>
    );
  }

  const s = data.streak;
  const v = viewOf(s);

  return (
    <Modal title={s.name} onClose={onClose} wide>
      <div className="mb-4 flex gap-1 rounded-lg border border-ember-line p-1">
        {(["path", "journal", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition-colors ${
              tab === t ? "bg-flame text-ash" : "text-paper-dim hover:text-paper"
            }`}
          >
            {t === "path" ? (v.isSprint ? "Sprint" : "Ascent") : t}
          </button>
        ))}
      </div>

      {tab === "path" && (
        <div>
          {v.isSprint && v.goalDays ? (
            <SprintRoadmap days={v.days} goal={v.goalDays} paused={v.isPaused} color={v.color} />
          ) : (
            <AscentRoadmap days={v.days} paused={v.isPaused} />
          )}
          <div className="mt-6 border-t border-ember-line pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-paper-dim">
              Every day so far
            </p>
            <Heatmap streak={s} resets={data.resets} color={v.color} />
          </div>
        </div>
      )}

      {tab === "journal" && (
        <div>
          <p className="prose-justify mb-4 text-xs text-paper-dim">
            A private thread for this one commitment — how it&apos;s going, what tempted you,
            what you noticed. Every note is stamped with the time you wrote it.
          </p>

          <div className="mb-4 flex max-h-72 flex-col gap-3 overflow-y-auto no-scrollbar">
            {data.chat.length === 0 ? (
              <p className="text-sm text-paper-dim">Nothing written yet.</p>
            ) : (
              data.chat.map((m) => (
                <div key={m.id} className="rounded-lg border border-ember-line bg-ash px-3 py-2.5">
                  <p className="prose-justify whitespace-pre-wrap text-sm text-paper">{m.body}</p>
                  <p className="mt-1.5 font-mono text-[10px] text-paper-dim">
                    {formatDateTime(m.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, LIMITS.chat))}
            rows={3}
            placeholder="What's going on with this one?"
            className="w-full resize-none rounded-lg border border-ember-line bg-ash px-3 py-2.5 text-sm focus:border-flame focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between">
            <PolishButton text={draft} onPolished={setDraft} />
            <CharCount value={draft} max={LIMITS.chat} />
          </div>
          <button
            onClick={send}
            disabled={!draft.trim() || sending}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-flame py-2.5 text-sm font-semibold text-ash disabled:opacity-40"
          >
            <Send size={14} /> {sending ? "Saving…" : "Add note"}
          </button>

          <div className="mt-6 border-t border-ember-line pt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                Pattern insight
              </p>
              <button
                onClick={runInsight}
                disabled={insightBusy}
                className="inline-flex items-center gap-1.5 rounded-full border border-ember-line px-2.5 py-1 text-[11px] text-paper-dim hover:border-flame hover:text-flame disabled:opacity-40"
              >
                <Sparkles size={12} /> {insightBusy ? "Reading…" : data.insight ? "Refresh" : "Read my notes"}
              </button>
            </div>
            {data.insight ? (
              <>
                <p className="prose-justify whitespace-pre-wrap text-sm text-paper">
                  {data.insight.content}
                </p>
                <p className="mt-2 font-mono text-[10px] text-paper-dim">
                  from your notes · {formatDate(data.insight.created_at)}
                </p>
              </>
            ) : (
              <p className="prose-justify text-xs text-paper-dim">
                Once you&apos;ve written a few notes, this reads them back and points out
                when and why the slips cluster. It describes patterns in your own words —
                it isn&apos;t advice, and it isn&apos;t a substitute for talking to someone.
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div>
          <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-paper-dim">Kind</dt>
              <dd>{v.isSprint ? `${s.goal_days}-day Sprint` : "Ascent"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-paper-dim">Created</dt>
              <dd>{formatDate(s.created_at)}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-paper-dim">Current run</dt>
              <dd>{s.start_date ? formatDate(s.start_date) : "paused"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-paper-dim">Times reset</dt>
              <dd>{s.reset_count}</dd>
            </div>
            {v.showsBest && (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-paper-dim">Best run</dt>
                <dd>{Math.max(s.max_streak, v.days)} {dayWord(Math.max(s.max_streak, v.days))}</dd>
              </div>
            )}
          </dl>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-paper-dim">
            Every break
          </p>
          {data.resets.length === 0 ? (
            <p className="text-sm text-paper-dim">Never broken.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.resets.map((r) => (
                <li key={r.id} className="border-b border-ember-line pb-3 last:border-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-mono text-sm">
                      {r.streak_reached} {dayWord(r.streak_reached)}
                    </span>
                    <span className="text-[11px] text-paper-dim">
                      {formatDate(r.run_start)} → {formatDate(r.reset_at)}
                    </span>
                  </div>
                  {r.note && (
                    <p className="prose-justify mt-1 text-xs text-paper-dim">{r.note}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
    </Modal>
  );
}
