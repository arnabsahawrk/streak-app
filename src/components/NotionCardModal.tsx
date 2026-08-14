"use client";

import { useState } from "react";
import type { Discipline } from "@/types";

export default function NotionCardModal({
  discipline,
  onClose,
}: {
  discipline: Discipline;
  onClose: () => void;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const imageUrl = `${origin}/api/badge/${discipline.id}?token=${discipline.public_token}`;
  const resetUrl = `${origin}/api/badge/${discipline.id}/reset?token=${discipline.public_token}`;
  const [copied, setCopied] = useState<"image" | "reset" | null>(null);

  async function copy(text: string, which: "image" | "reset") {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add to Notion</h2>
          <button onClick={onClose} className="text-paper-dim text-sm">
            Close
          </button>
        </div>

        <p className="text-paper-dim text-xs mb-4">
          Two links. Both stay the same forever — the image always shows today's
          number, it just redraws itself each time it's opened.
        </p>

        <img
          src={imageUrl}
          alt={`${discipline.name} streak`}
          className="w-full rounded-lg border border-ember-line mb-4"
        />

        <label className="block text-xs text-paper-dim mb-1.5">
          Image link — paste as an image block in Notion
        </label>
        <div className="flex gap-2 mb-4">
          <input
            readOnly
            value={imageUrl}
            onFocus={(e) => e.target.select()}
            className="flex-1 min-w-0 bg-ash border border-ember-line rounded-lg px-3 py-2 text-xs font-mono truncate"
          />
          <button
            onClick={() => copy(imageUrl, "image")}
            className="shrink-0 rounded-lg border border-ember-line px-3 text-xs text-paper-dim hover:text-paper"
          >
            {copied === "image" ? "Copied" : "Copy"}
          </button>
        </div>

        <label className="block text-xs text-paper-dim mb-1.5">
          Reset link — turn into text and link it, next to the image
        </label>
        <div className="flex gap-2">
          <input
            readOnly
            value={resetUrl}
            onFocus={(e) => e.target.select()}
            className="flex-1 min-w-0 bg-ash border border-ember-line rounded-lg px-3 py-2 text-xs font-mono truncate"
          />
          <button
            onClick={() => copy(resetUrl, "reset")}
            className="shrink-0 rounded-lg border border-ember-line px-3 text-xs text-paper-dim hover:text-paper"
          >
            {copied === "reset" ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-paper-dim text-[11px] mt-2">
          Opening it shows a confirm screen first — it won&apos;t reset just from
          being previewed or clicked by accident.
        </p>
      </div>
    </div>
  );
}
