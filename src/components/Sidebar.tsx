"use client";

import Image from "next/image";
import { X, LogOut, Archive, User, Settings as Cog, ExternalLink } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/session";
import type { UserSettings } from "@/lib/types";

export default function Sidebar({
  user,
  settings,
  onClose,
  onOpen,
}: {
  user: SessionUser;
  settings: UserSettings;
  onClose: () => void;
  onOpen: (what: "archive" | "profile" | "settings") => void;
}) {
  const name = settings.display_name || user.name || "You";

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="no-scrollbar relative ml-auto flex h-full w-72 flex-col overflow-y-auto border-l border-ember-line bg-ash-raised p-5 sm-rise"
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image src={user.image} alt="" width={40} height={40} className="rounded-full" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-flame font-semibold text-ash">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-[11px] text-paper-dim">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="text-paper-dim hover:text-paper">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { key: "archive" as const, icon: Archive, label: "Archive" },
            { key: "profile" as const, icon: User, label: "Profile" },
            { key: "settings" as const, icon: Cog, label: "Settings" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => { onOpen(key); onClose(); }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper-dim transition-colors hover:bg-ash hover:text-paper"
            >
              <Icon size={16} /> {label}
            </button>
          ))}

          {settings.commitment_url && (
            <a
              href={settings.commitment_url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper-dim transition-colors hover:bg-ash hover:text-paper"
            >
              <ExternalLink size={16} />
              <span className="truncate">{settings.commitment_label || "My commitment"}</span>
            </a>
          )}
        </nav>

        <button
          onClick={() => signOut().then(() => { window.location.href = "/signin"; })}
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper-dim transition-colors hover:bg-ash hover:text-red-400"
        >
          <LogOut size={16} /> Sign out
        </button>

        <div className="mt-auto border-t border-ember-line pt-4">
          <p className="text-[11px] text-paper-dim">
            A project by{" "}
            <a
              href="https://arnabsaha.vercel.app"
              target="_blank"
              rel="noreferrer noopener"
              className="text-flame hover:underline"
            >
              Arnab Saha
            </a>
          </p>
        </div>
      </aside>
    </div>
  );
}
