"use client";

import { useState } from "react";
import type { Discipline } from "@/types";

export default function ShareCardModal({
  discipline,
  onClose,
}: {
  discipline: Discipline;
  onClose: () => void;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/api/badge/${discipline.id}?token=${discipline.public_token}`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="w-full sm:max-w-sm bg-ash-raised border border-ember-line rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Share card</h2>
          <button onClick={onClose} className="text-paper-dim text-sm">
            Close
          </button>
        </div>

        <p className="text-paper-dim text-xs mb-4">
          One link, two ways to use it. In Notion, type <strong>/embed</strong>{" "}
          and paste this link — that gives you a live, clickable card with a
          working Reset button, same as it looks below. Pasting it as an{" "}
          <strong>image</strong> instead only shows a picture; pictures can&apos;t
          be clicked, in Notion or anywhere else — so use /embed if you want
          the Reset button to work.
        </p>

        <img
          src={url}
          alt={`${discipline.name} streak`}
          className="w-full rounded-lg border border-ember-line mb-4"
        />

        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="flex-1 min-w-0 bg-ash border border-ember-line rounded-lg px-3 py-2 text-xs font-mono truncate"
          />
          <button
            onClick={copy}
            className="shrink-0 rounded-lg border border-ember-line px-3 text-xs text-paper-dim hover:text-paper"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-paper-dim text-[11px] mt-2">
          Anyone with this link can view or reset this one commitment — it
          doesn&apos;t need your passcode. Don&apos;t post it anywhere public.
        </p>
      </div>
    </div>
  );
}
