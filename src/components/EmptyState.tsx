"use client";

export default function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-ember-line py-16 px-6 text-center">
      <p className="text-lg font-semibold mb-1">No streaks lit yet</p>
      <p className="text-paper-dim text-sm mb-6">
        Add the first thing you&apos;re committing to. Everything else can wait.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-full bg-flame text-ash font-semibold px-5 py-2.5 text-sm active:scale-95 transition-transform"
      >
        Light the first one
      </button>
    </div>
  );
}
