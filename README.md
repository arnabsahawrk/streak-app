# Streak

A personal, install-as-an-app streak tracker. Add a commitment, watch the
day count climb, reset when you need to.

## What's here

- **Next.js 16** (App Router, TypeScript, Tailwind **v4**). Note: v4
  requires Safari 16.4+ and won't render on older devices (e.g. an
  iPhone 7, capped at iOS 15) — a known, accepted tradeoff here.
- **Neon Postgres** for storage, via `postgres` — two tables, no ORM
- **Serwist** for the service worker / offline shell / installability
- **Motion** for animation, **canvas-confetti** for milestone tier-ups
- A passcode gate (middleware + a session-only cookie — it asks again every
  time the browser/app fully closes, by design)

Streaks are never stored as a counter — `current streak = now − start_date`,
computed on every read. Archived items freeze instead: the streak is
computed as of `archived_at`, not live, so the number stops moving.

## Setup

1. **Install deps**
   ```
   npm install
   ```

2. **Database.** Create a free Neon project (directly at
   [neon.tech](https://neon.tech), or via the Neon integration in the
   Vercel Marketplace). Run **`migrate.sql`** against it once — paste it
   into Neon's SQL Editor and run. This one file is safe to re-run any
   number of times against a database at any previous version of this
   schema; it only applies what's missing.

3. **Environment variables.** Copy `.env.example` to `.env.local`, fill in
   `DATABASE_URL` and `APP_PASSCODE`. Add the same two in Vercel →
   Project → Settings → Environment Variables before deploying.

4. **Icons.** Already in `public/icons/` — regenerate with
   `python3 scripts/make_icons.py` if you want a different look (needs
   `pip install pillow numpy`).

5. **Run it:** `npm run dev`, visit `localhost:3000`.

6. **Deploy.** Push to GitHub (keep the repo **private**), import in
   Vercel, set the two env vars there too, deploy.

## Notes

- **Tiers** live in `src/lib/tiers.ts` — names, motivating lines, colors,
  and day thresholds are all just data. Day 0 is its own state
  (`ZERO_STATE`, red), separate from the "Begin" tier proper, so the tier
  badge and the "days to next tier" line never contradict each other.
- **Why is required.** Every commitment needs a reason; it's shown in full
  on the card, never truncated.
- **Archiving doesn't delete.** It freezes the streak, stops the count, and
  moves the item into Archive history (button in the header) — nothing is
  removed from the database. Restoring starts a fresh count rather than
  resuming a stale one.
- **History** (past resets, with the date range each run covered) only
  shows once a discipline has actually had a reset — the button stays
  hidden until then.
- **The Share link** (`/api/badge/[id]?token=...`) is one URL that does two
  things depending on how it's requested: embedded as an image (e.g. in
  Notion), it returns a live SVG that redraws itself from the database on
  every fetch. Opened directly in a browser, it returns an interactive page
  with a real Reset button. Anyone with the link can view or reset that one
  discipline — it doesn't check your passcode — so don't post it publicly.
- The Notion commitment link in the header is hardcoded in
  `src/app/page.tsx`.
