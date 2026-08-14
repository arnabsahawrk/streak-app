"use client";

import { useCallback, useEffect, useState } from "react";
import type { Discipline } from "@/types";
import { currentStreakDays } from "@/lib/streak";
import DisciplineCard from "@/components/DisciplineCard";
import AddDisciplineModal from "@/components/AddDisciplineModal";
import EmptyState from "@/components/EmptyState";

const NOTION_URL =
  "https://app.notion.com/p/arnabsahawrk/Commitment-3aeb14a91aeb80c5b8d8cd3fa66023ee";

export default function DashboardPage() {
  const [disciplines, setDisciplines] = useState<Discipline[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/disciplines");
    const data = await res.json();
    setDisciplines(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = disciplines
    ? [...disciplines].sort(
        (a, b) => currentStreakDays(a.start_date) - currentStreakDays(b.start_date)
      )
    : [];

  return (
    <main className="max-w-2xl mx-auto px-5 pb-32 pt-8 sm:pt-14">
      <header className="flex items-start justify-between mb-10">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-paper-dim uppercase">
            Streak
          </p>
          <h1 className="text-2xl font-semibold mt-1">Keep the commitment alive</h1>
        </div>
        <a
          href={NOTION_URL}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-ember-line px-3 py-1.5 text-xs text-paper-dim hover:text-paper hover:border-paper-dim transition-colors"
        >
          Read commitment ↗
        </a>
      </header>

      {disciplines === null ? (
        <p className="text-paper-dim text-sm">Loading…</p>
      ) : sorted.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((d) => (
            <DisciplineCard key={d.id} discipline={d} onChange={load} />
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        aria-label="Add a commitment"
        className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 h-14 w-14 rounded-full bg-flame text-ash text-3xl leading-none flex items-center justify-center shadow-[0_8px_30px_rgba(232,112,58,0.35)] active:scale-95 transition-transform"
      >
        +
      </button>

      {showAdd && (
        <AddDisciplineModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </main>
  );
}
