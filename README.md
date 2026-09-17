# Streak

A personal, install-as-an-app streak tracker. Add a commitment, watch the
day count climb, reset when you need to — resetting pauses it rather than
immediately restarting, so there's no pressure to jump back in the same
day; tap Start whenever you actually do.

## What's here

- **Next.js 15.5** (App Router, TypeScript, Tailwind **v3**), configured to
  support older Safari/iOS browsers including Safari on iOS 15 (iPhone 7).
- **Neon Postgres** for storage, via `postgres` — two tables, no ORM
- **Serwist** for the service worker / offline shell / installability
- **Motion** for animation, **canvas-confetti** for milestone tier-ups
- A passcode gate (middleware + a session-only cookie — it asks again every
  time the browser/app fully closes, by design)

The app intentionally avoids Tailwind v4 and the Next.js 16 runtime baseline
because those require newer Safari versions than an iPhone 7 can provide.

Scrollbars are hidden app-wide (plain CSS in `globals.css`, plus a
`.no-scrollbar` class on scrollable panels) — scrolling by wheel, touch and
keyboard all still work, only the bar is gone.

Streaks are never stored as a counter — `current streak = now − start_date`,
computed on every read. Archived items freeze instead: the streak is
computed as of `archived_at`, not live, so the number stops moving.

**Paused is a real third state**, not just "day 0." `start_date` is
nullable — `null` means reset-but-not-restarted. Resetting sets it to
`null` (not `now()`); a separate Start action sets it to `now()`. Every
place that reads `start_date` treats `null` as zero (`currentStreakDays`
handles this centrally, in `src/lib/streak.ts`), which is also what stops
archiving a paused discipline from corrupting `max_streak` — without that
guard, `new Date(null)` resolves to the Unix epoch and "days since" math
would explode. The card, the Share badge, and the sort order on the
dashboard all show/treat paused distinctly from an active day-0 streak.

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
  and day thresholds are all just data. Colors follow real metal
  temperature/tempering colors rather than an arbitrary rainbow (see the
  comment there for the full reasoning). Day 0 is its own state
  (`ZERO_STATE`), separate from the "Begin" tier proper, so the tier badge
  and the "days to next tier" line never contradict each other.
- **Why is required.** Every commitment needs a reason; it's shown in full
  on the card, never truncated — the card's height simply grows to fit it.
- **Two shapes of commitment**, decided when you create one and stored in
  `goal_days`:
  - `null` — the open-ended tier ladder (Begin … Legend). This is what
    every commitment created before challenges existed gets automatically,
    so adding the column changed nothing about anything already running.
  - `N` — a fixed N-day challenge (1–365, enforced by a CHECK constraint
    and again in the API). It *completes* at N days: the card turns gold,
    the ring fills, and the Reset button becomes "Finish and archive".
  `src/lib/progress.ts` is the single place that turns a row into what the
  UI draws, so the card, the shared badge, and the path view can't drift
  apart. It reads `goal_days` with `?? null`, which also catches
  `undefined` — so a database that predates the column degrades to ladder
  behaviour instead of throwing.
- **The path** (route icon on each card) shows the whole journey: every
  tier, its day threshold, and its line, with everything you've passed lit
  in its tier colour, your current position marked, and what's ahead dimmed
  but still readable. Challenges show day-by-day steps instead.
- **Archiving is permanent.** It freezes the *best* streak that discipline
  ever reached (banked into `max_streak` at archive time) and moves the
  item to Archive history (button in the header, only visible once
  something's actually there) — there's no restore. Confirming requires
  both typing the discipline's name and giving a closing note — the note is
  required (enforced in the confirm dialog and again in the API, not just
  a DB constraint, since it only ever applies to archived rows) and shows
  up alongside that item in Archive history. Its Share link stops working
  the moment it's archived.
- **History** (past resets, with the date range each run covered) only
  shows once a discipline has actually had a reset — the button stays
  hidden until then.
- **The Share link** (`/api/badge/[id]?token=...`) is read-only by design —
  it always returns a live SVG snapshot of that discipline's current state,
  nothing else reachable from it, and it 404s once that discipline is
  archived. Paste it as an image anywhere (Notion included) and it redraws
  itself from the database on every fetch. Anyone with the link can view
  that one discipline's streak while it's active — it doesn't check your
  passcode — so don't post it publicly.
- The Notion commitment link in the header is hardcoded in
  `src/app/page.tsx`.
