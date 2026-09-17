"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "./Modal";
import CharCount from "./CharCount";
import { LIMITS } from "@/lib/limits";
import type { SessionUser } from "@/lib/session";
import type { UserSettings } from "@/lib/types";

export default function ProfileSheet({
  user,
  settings,
  onClose,
  onSaved,
}: {
  user: SessionUser;
  settings: UserSettings;
  onClose: () => void;
  onSaved: (s: UserSettings) => void;
}) {
  const [name, setName] = useState(settings.display_name ?? "");
  const [dob, setDob] = useState(settings.date_of_birth ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true); setErr(null); setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: name, date_of_birth: dob || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't save.");
      onSaved(data);
      setMsg("Saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Profile" onClose={onClose}>
      <div className="mb-5 flex items-center gap-4">
        {user.image ? (
          <Image src={user.image} alt="" width={56} height={56} className="rounded-full" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-flame text-xl font-semibold text-ash">
            {(name || user.name || "?").charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm">{user.email}</p>
          <p className="text-[11px] text-paper-dim">From your Google account — not editable here.</p>
        </div>
      </div>

      <label className="mb-1.5 block text-xs text-paper-dim">Display name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, LIMITS.displayName))}
        placeholder={user.name || "What should the app call you?"}
        className="w-full rounded-lg border border-ember-line bg-ash px-3 py-2.5 text-sm focus:border-flame focus:outline-none"
      />
      <div className="mt-1 flex justify-end"><CharCount value={name} max={LIMITS.displayName} /></div>

      <label className="mb-1.5 mt-3 block text-xs text-paper-dim">Date of birth</label>
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        className="w-full rounded-lg border border-ember-line bg-ash px-3 py-2.5 text-sm focus:border-flame focus:outline-none"
      />

      {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
      {msg && <p className="mt-3 text-xs text-flame">{msg}</p>}

      <button
        onClick={save}
        disabled={busy}
        className="mt-5 w-full rounded-lg bg-flame py-2.5 text-sm font-semibold text-ash disabled:opacity-40"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </Modal>
  );
}
