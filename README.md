# Commitment

A personal, install-as-an-app streak tracker. Add a commitment, watch the
day count climb, reset when you need to — nothing else.

## What's here

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Neon Postgres** for storage, via `postgres` — two tables, no ORM
- **Serwist** for the service worker / offline shell / installability
- **Motion** for the streak count-up, **canvas-confetti** for milestone tier-ups
- A small passcode gate (middleware + one cookie) since Vercel's free tier
  doesn't password-protect a production URL

Streaks are never stored as a counter — `current streak = now − start_date`,
computed on every read. Nothing needs a cron job to "tick."

## Setup

1. **Install deps**
   ```
   npm install
   ```

2. **Database.** Create a free Neon project (either directly at
   [neon.tech](https://neon.tech), or by adding the Neon integration from
   the Vercel Marketplace to this project, which does it for you). Then run
   `migration.sql` against it once — easiest way is pasting it into the
   Neon console's SQL editor.

3. **Environment variables.** Copy `.env.example` to `.env.local` and fill
   in `DATABASE_URL` (from Neon) and `APP_PASSCODE` (anything you'll
   remember). Add the same two in Vercel → Project → Settings →
   Environment Variables before you deploy.

4. **Icons.** Placeholder icons are already in `public/icons/` — regenerate
   them anytime with `python3 scripts/make_icons.py` if you want to try a
   different look (needs `pip install pillow numpy`).

5. **Run it**
   ```
   npm run dev
   ```
   Visit `localhost:3000`. If `APP_PASSCODE` is set, `npm run build &&
   npm start` is a closer match to production (the dev server's fast
   refresh doesn't always exercise the service worker correctly).

6. **Deploy.** Push to GitHub, import the repo in Vercel, set the two env
   vars there, deploy. **Make the repo private** — nothing personal ever
   gets committed (your commitments live only in the database, entered
   through the UI), but there's no reason for the repo itself to be public.

## Notes

- The tier ladder lives in `src/lib/tiers.ts` — names, colors, and day
  thresholds are all just data, safe to edit freely.
- The Notion link in the header is hardcoded in `src/app/page.tsx`.
- `reset_log` isn't surfaced in the UI yet — it's there so a stats/heatmap
  view has history to draw on later.
