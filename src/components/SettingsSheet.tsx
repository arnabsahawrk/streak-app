"use client";

import { useState } from "react";
import Modal from "./Modal";
import { LIMITS } from "@/lib/limits";
import type { UserSettings } from "@/lib/types";

function Toggle({
  label, hint, checked, onChange,
}: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-lg border border-ember-line bg-ash px-3 py-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm">{label}</span>
        <span className="prose-justify mt-0.5 block text-[11px] text-paper-dim">{hint}</span>
      </span>
      <span
        className={`mt-0.5 h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${checked ? "bg-flame" : "bg-ember-line"}`}
      >
        <span className={`block h-4 w-4 rounded-full bg-paper transition-transform ${checked ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

export default function SettingsSheet({
  settings, onClose, onSaved,
}: { settings: UserSettings; onClose: () => void; onSaved: (s: UserSettings) => void }) {
  const [s, setS] = useState(settings);
  const [url, setUrl] = useState(settings.commitment_url ?? "");
  const [label, setLabel] = useState(settings.commitment_label ?? "");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setBusy(true); setErr(null); setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't save.");
      setS(data); onSaved(data); setMsg("Saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't save.");
    } finally { setBusy(false); }
  }

  async function passcode(action: "set" | "remove") {
    setBusy(true); setErr(null); setMsg(null);
    try {
      const res = await fetch("/api/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, passcode: pass }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't update the passcode.");
      const next = { ...s, has_passcode: action === "set" };
      setS(next); onSaved(next); setPass("");
      setMsg(action === "set" ? "Passcode set." : "Passcode removed.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't update the passcode.");
    } finally { setBusy(false); }
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-paper-dim">Email</p>
      <div className="mb-5 flex flex-col gap-2">
        <Toggle
          label="Milestone emails"
          hint="A note when you cross a step on an Ascent, or finish a Sprint. Checked once a day."
          checked={s.email_milestones}
          onChange={(v) => patch({ email_milestones: v })}
        />
        <Toggle
          label="Weekly review"
          hint="A short summary of the week across every commitment."
          checked={s.email_weekly}
          onChange={(v) => patch({ email_weekly: v })}
        />
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-paper-dim">
        Your commitment doc
      </p>
      <p className="prose-justify mb-2 text-[11px] text-paper-dim">
        A link to wherever you keep the promise you&apos;re holding yourself to — a Notion
        page, a Google Doc, anything. It sits in the menu so it&apos;s one tap away when
        you need reminding why.
      </p>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value.slice(0, LIMITS.commitmentUrl))}
        placeholder="https://…"
        className="mb-2 w-full rounded-lg border border-ember-line bg-ash px-3 py-2.5 text-sm focus:border-flame focus:outline-none"
      />
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value.slice(0, LIMITS.commitmentLabel))}
        placeholder="What to call it (e.g. My commitment)"
        className="w-full rounded-lg border border-ember-line bg-ash px-3 py-2.5 text-sm focus:border-flame focus:outline-none"
      />
      <button
        onClick={() => patch({ commitment_url: url, commitment_label: label })}
        disabled={busy}
        className="mt-2 w-full rounded-lg border border-ember-line py-2 text-sm text-paper-dim hover:border-flame hover:text-flame disabled:opacity-40"
      >
        Save link
      </button>

      <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-paper-dim">
        App passcode
      </p>
      <p className="prose-justify mb-2 text-[11px] text-paper-dim">
        A second lock on top of your Google sign-in, for a shared or borrowed device.
        You&apos;ll be asked for it each time the app is opened fresh.
      </p>
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder={s.has_passcode ? "Current passcode to remove it" : "Choose a passcode"}
        className="w-full rounded-lg border border-ember-line bg-ash px-3 py-2.5 font-mono text-sm tracking-widest focus:border-flame focus:outline-none"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => passcode("set")}
          disabled={busy || pass.length < 4}
          className="flex-1 rounded-lg bg-flame py-2 text-sm font-semibold text-ash disabled:opacity-40"
        >
          {s.has_passcode ? "Change" : "Set passcode"}
        </button>
        {s.has_passcode && (
          <button
            onClick={() => passcode("remove")}
            disabled={busy}
            className="flex-1 rounded-lg border border-ember-line py-2 text-sm text-paper-dim hover:text-red-400 disabled:opacity-40"
          >
            Remove
          </button>
        )}
      </div>

      {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
      {msg && <p className="mt-3 text-xs text-flame">{msg}</p>}
    </Modal>
  );
}
