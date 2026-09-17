"use client";

import { useState } from "react";
import Modal from "./Modal";
import type { Streak } from "@/lib/types";

const TABS = ["link", "markdown", "html", "notion"] as const;
type Tab = (typeof TABS)[number];

/** One live image URL, offered in whichever form the destination wants.
 *  Notion is one of them, not the whole point. */
export default function ShareDialog({ streak, onClose }: { streak: Streak; onClose: () => void }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/api/badge/${streak.id}?token=${streak.public_token}`;
  const [tab, setTab] = useState<Tab>("link");
  const [copied, setCopied] = useState(false);

  const snippets: Record<Tab, string> = {
    link: url,
    markdown: `![${streak.name} streak](${url})`,
    html: `<img src="${url}" alt="${streak.name} streak" width="480">`,
    notion: url,
  };

  async function copy() {
    await navigator.clipboard.writeText(snippets[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal title="Share this streak" onClose={onClose}>
      <p className="prose-justify mb-4 text-xs text-paper-dim">
        One link that redraws itself from live data every time it loads — it always shows
        today&apos;s real number, so you never re-paste it. Works anywhere an image does:
        a README, a blog, a dashboard, a Notion page.
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`${streak.name} streak`} className="mb-4 w-full rounded-lg border border-ember-line" />

      <div className="mb-2 flex gap-1 rounded-lg border border-ember-line p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-1.5 text-[11px] font-medium capitalize transition-colors ${
              tab === t ? "bg-flame text-ash" : "text-paper-dim hover:text-paper"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "notion" && (
        <p className="mb-2 text-[11px] text-paper-dim">
          In Notion, type <span className="font-mono text-paper">/image</span> → Embed link, and paste this.
        </p>
      )}

      <div className="flex gap-2">
        <input
          readOnly
          value={snippets[tab]}
          onFocus={(e) => e.target.select()}
          className="min-w-0 flex-1 truncate rounded-lg border border-ember-line bg-ash px-3 py-2 font-mono text-xs"
        />
        <button
          onClick={copy}
          className="shrink-0 rounded-lg border border-ember-line px-3 text-xs text-paper-dim hover:border-flame hover:text-flame"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p className="mt-2 text-[11px] text-paper-dim">
        Anyone with this link can see this streak — no sign-in needed — so keep it
        somewhere you control. It stops working the moment you archive the streak.
      </p>
    </Modal>
  );
}
