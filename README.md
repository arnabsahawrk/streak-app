# STREAKMENT

**Keep the commitment alive.**

Streakment is a free, installable web app for tracking the promises you've
made to yourself. You start a commitment, and it counts the days. When you
break it, you say so, write down what happened, and begin again when you're
ready — not the same minute, not under pressure.

Live at **[streakment.vercel.app](https://streakment.vercel.app)**.

---

## What it does

### Two ways to hold a commitment

**Ascent** — open-ended, no finish line. The day count climbs through ten
milestones, each with its own name, colour and line:

| Days | Milestone | What it says |
|---:|---|---|
| 0 | Day Zero | I can do this all day. |
| 1–2 | Begin | I decided to change. |
| 3–6 | Commit | I chose the better path. |
| 7–14 | Control | I am learning to control myself. |
| 15–20 | Discipline | I am building a new me. |
| 21–29 | Consistent | This is becoming who I am. |
| 30–59 | Thrive | My old habits are losing their hold. |
| 60–89 | Strong | I am no longer who I used to be. |
| 90–179 | Dedicated | I live by my commitment. |
| 180–364 | Master | Discipline has become part of me. |
| 365+ | Legend | I became the person I promised to become. |

The colours aren't arbitrary. They follow how metal actually behaves under
heat: the early milestones run through the incandescence sequence a smith
sees as iron warms — dull red, red, orange, yellow, near-white — matching
the struggle in those lines. From Dedicated onward they switch to tempering
colours, the oxides steel takes on as it hardens, matching the shift from
striving to settled identity. Legend leaves steel for gold.

**Sprint** — fixed length, 1 to 365 days. Pick three days to break a loop,
or thirty to prove something. It completes when you reach the number, turns
gold, and offers to finish and archive. A Sprint never shows a "best run" —
you either got there or you didn't, and a personal best is noise.

### Resetting doesn't restart you

When you reset, the streak **pauses** instead of immediately counting again.
Nothing runs until you tap **Begin**. That's deliberate: a slip on Tuesday
shouldn't force you back on the clock the same day, and pretending otherwise
is how people quit entirely.

Your best run is banked before the reset, so breaking never erases what you
already did.

### The journal

Every commitment has its own private thread. Write how it's going, what
tempted you, what you noticed about yourself. Each note is stamped with the
date and time you wrote it, so reading back tells you *when* you were
struggling, not just that you were.

### The heatmap

Every day since the commitment started, as a monthly grid: days you held
(in the milestone colour), the days you broke (red), and the stretches when
nothing was running. It only ever shows months from the one you began in —
a commitment started in September never renders an empty May.

Nothing extra is stored to make this work. Every run is already bounded by
its start and its reset, so the whole record is reconstructed from data the
app keeps anyway.

### The roadmap

The full climb as a rope of lit and unlit stations: everything you've passed
burns in its colour, where you stand now pulses, and what's ahead stays
readable but cold. Seeing where this goes is the point.

### Milestone emails

When you cross a milestone or finish a Sprint, you get an email. This is
checked once a day — the app calculates streaks when you open it, so nothing
happens at midnight by itself, and the free hosting tier runs scheduled jobs
once daily. You get the email on the day you cross, not the minute.

Every send is recorded, and the record has a uniqueness guarantee, so a
retry or an overlapping run can never send you the same congratulation
twice.

### AI, where it earns its place

- **Polish** — tidies spelling and grammar in anything you write, keeping
  your voice and meaning. Runs only when you ask.
- **Pattern insight** — reads your own journal notes and reset history and
  points out when and why the slips cluster. Grounded only in what you
  wrote. It describes patterns; it doesn't diagnose, and it isn't a
  substitute for talking to someone.

### Share a live streak

One link that redraws itself from current data every time it loads, so it
always shows today's real number. Copy it as a plain link, Markdown, or an
HTML tag — it works in a Notion page, a README, a blog, a dashboard,
anywhere an image does. It needs no sign-in, and stops working the moment
you archive that streak.

### Your archive

Finishing a commitment doesn't delete it. The archive keeps what it was, why
you started, when, how far it got, how many times it broke, your closing
note, and the whole journal and history behind it.

### Everything else

- **Google sign-in.** Each account's streaks are entirely their own.
- **Optional passcode** on top of sign-in, for a shared or borrowed device.
- **Your commitment doc** — a link to wherever you keep the promise you're
  holding yourself to (Notion, Google Docs, anything), one tap away in the
  menu.
- **Profile** — your picture and email come from Google; your display name
  and date of birth are yours to set.
- **Installable and offline-capable**, with scrollbars hidden and text
  justified throughout.
- **Built for old devices too** — pinned to Next.js 15 and Tailwind 3 and
  compiled for Safari 12, so it works on phones a newer stack drops.

---

## Running it yourself

### 1. Database

Create a free [Neon](https://neon.tech) project and run **`schema.sql`**
once in its SQL Editor. Keep the pooled connection string.

### 2. Google sign-in

In the [Google Cloud Console](https://console.cloud.google.com): new project
→ OAuth consent screen (External; add yourself as a test user) → Credentials
→ **OAuth client ID**, type *Web application*.

Authorised redirect URIs:

```
https://YOUR-APP.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

### 3. Email

Create a free [Brevo](https://brevo.com) account, validate your sender
address, and make an API key under *SMTP & API*. Brevo is used rather than
Resend because it sends from a validated address without requiring you to
own and configure a domain, and its free tier (300/day) doesn't expire.

### 4. AI

Get a key at [console.groq.com/keys](https://console.groq.com/keys). Free,
no card, rate-limited well above personal use.

### 5. Environment

Copy `.env.example` to `.env.local` and fill it in. Generate the auth secret
with `openssl rand -base64 32`. Set the same variables in Vercel → Settings
→ Environment Variables.

### 6. Run

```bash
npm install
npm run dev
```

### 7. Deploy

Push to GitHub, import in Vercel, add the environment variables, deploy.
`vercel.json` registers the daily 03:00 UTC cron automatically.

---

## How it's built

```
src/
  auth.ts              Better Auth (Google), owns user/session/account tables
  middleware.ts        Cheap edge cookie check; real validation is server-side
  lib/
    session.ts         Session + settings; the actual security boundary
    streak.ts          Day maths and display caps
    tiers.ts           The ten milestones
    progress.ts        One view model shared by card, badge and roadmap
    heatmap.ts         Rebuilds every day from run boundaries
    badge.ts           The live share image
    email.ts  ai.ts    Brevo and Groq
    limits.ts          Text ceilings, mirrored by database constraints
  components/          Card, roadmap, heatmap, journal, dialogs, sheets
  app/api/             Per-user scoped routes; cron/daily sends milestones
```

Three ideas hold the whole thing together:

1. **Streaks are never stored as a number.** The count is always
   `now − start_date`, computed on read. There's no counter to drift, and
   nothing needs a background job just to make the numbers move.
2. **`start_date = null` means paused.** That single representation gives
   the pause-after-reset behaviour for free, and it's treated as zero
   everywhere so archiving a paused streak can't write a nonsense record.
3. **One view model.** `progress.ts` turns a row into everything the UI
   draws, so the card, the share image and the roadmap can't disagree.

Limits are enforced in the database *and* the API, so a bug in one layer
can't bypass the other.

---

A project by [Arnab Saha](https://arnabsaha.vercel.app).
