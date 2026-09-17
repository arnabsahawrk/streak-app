-- ============================================================
--  STREAKMENT — full schema
--  Keep the commitment alive.
--
--  Run once against a fresh Neon database. Written to cover every
--  planned feature up front so nothing needs a painful migration
--  half way through the build.
--
--  NOTE ON CASING: the first four tables are Better Auth's own. It
--  expects camelCase column names, so they are quoted here. Every
--  application table below uses snake_case as usual.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  1. Better Auth — identity. Managed by the library; the app
--     reads from these but never writes to them directly.
-- ------------------------------------------------------------

create table if not exists "user" (
  "id"            text primary key,
  "name"          text not null,
  "email"         text not null unique,
  "emailVerified" boolean not null default false,
  "image"         text,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);

create table if not exists "session" (
  "id"        text primary key,
  "expiresAt" timestamptz not null,
  "token"     text not null unique,
  "ipAddress" text,
  "userAgent" text,
  "userId"    text not null references "user"("id") on delete cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists session_user_idx on "session"("userId");

create table if not exists "account" (
  "id"                    text primary key,
  "accountId"             text not null,
  "providerId"            text not null,
  "userId"                text not null references "user"("id") on delete cascade,
  "accessToken"           text,
  "refreshToken"          text,
  "idToken"               text,
  "accessTokenExpiresAt"  timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope"                 text,
  "password"              text,
  "createdAt"             timestamptz not null default now(),
  "updatedAt"             timestamptz not null default now()
);
create index if not exists account_user_idx on "account"("userId");

create table if not exists "verification" (
  "id"         text primary key,
  "identifier" text not null,
  "value"      text not null,
  "expiresAt"  timestamptz not null,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);

-- ------------------------------------------------------------
--  2. Profile + settings. Separate from "user" so Better Auth
--     keeps sole ownership of that table. Name and picture come
--     from Google and are never edited here; display_name is the
--     editable override.
-- ------------------------------------------------------------

create table if not exists user_settings (
  user_id          text primary key references "user"("id") on delete cascade,
  display_name     text,
  date_of_birth    date,
  -- Optional app passcode, on top of Google sign-in. Null = off.
  -- Stored as a SHA-256 hash, never in the clear.
  passcode_hash    text,
  -- Milestone + weekly-review email opt-outs.
  email_milestones boolean not null default true,
  email_weekly     boolean not null default true,
  -- IANA zone, e.g. "Asia/Dhaka". Decides which local day a
  -- milestone lands on when the daily cron runs.
  timezone         text not null default 'UTC',
  -- Link to wherever the user keeps the commitment they are holding
  -- themselves to - a Notion page, a Google Doc, anything. Shown in
  -- the sidebar when set.
  commitment_url   text,
  commitment_label text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint display_name_len  check (display_name is null or char_length(display_name) <= 80),
  -- Sanity bounds only: blocks typos and impossible dates, not a
  -- minimum-age gate.
  constraint dob_sane          check (date_of_birth is null
                                      or (date_of_birth > date '1900-01-01'
                                          and date_of_birth < current_date)),
  constraint commitment_url_len   check (commitment_url is null or char_length(commitment_url) <= 500),
  constraint commitment_label_len check (commitment_label is null or char_length(commitment_label) <= 60)
);

-- ------------------------------------------------------------
--  3. Streaks.
--
--  kind = 'ascent' : open-ended climb, goal_days must be null
--  kind = 'sprint' : fixed-length, goal_days required (1..365)
--
--  start_date null  = paused (reset, not yet restarted)
--  Current streak is always derived from start_date, never stored,
--  so there is no counter to keep in sync and no cron needed just
--  to make the numbers move.
-- ------------------------------------------------------------

create table if not exists disciplines (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null references "user"("id") on delete cascade,
  name           text not null,
  why_note       text not null,
  kind           text not null default 'ascent',
  goal_days      integer,
  start_date     timestamptz default now(),
  max_streak     integer not null default 0,
  reset_count    integer not null default 0,
  archived       boolean not null default false,
  archived_at    timestamptz,
  archive_reason text,
  -- Random per-streak token for the public share image. Rotatable
  -- without touching the row id.
  public_token   text not null default gen_random_uuid()::text,
  created_at     timestamptz not null default now(),

  -- Generous text ceilings. These exist to stop a runaway paste
  -- from eating the free-tier disk, not to make you be brief.
  constraint name_len      check (char_length(name) between 1 and 80),
  constraint why_len       check (char_length(why_note) between 1 and 1200),
  constraint reason_len    check (archive_reason is null or char_length(archive_reason) <= 1200),

  constraint kind_valid    check (kind in ('ascent', 'sprint')),
  -- The two shapes are mutually exclusive, enforced here rather
  -- than trusted to the API alone.
  -- The explicit `is not null` matters: without it, a sprint row with a
  -- null goal_days makes the BETWEEN evaluate to unknown, and Postgres
  -- passes a CHECK whose result is unknown rather than failing it - so a
  -- goalless sprint would slip straight through.
  constraint goal_matches_kind check (
    (kind = 'ascent' and goal_days is null) or
    (kind = 'sprint' and goal_days is not null and goal_days between 1 and 365)
  )
);
create index if not exists disciplines_user_idx on disciplines(user_id, archived);
create unique index if not exists disciplines_token_idx on disciplines(public_token);

-- ------------------------------------------------------------
--  4. Reset history. run_start + reset_at bound each broken run,
--     which is also what lets the heatmap reconstruct every held
--     and broken day without storing a row per day.
-- ------------------------------------------------------------

create table if not exists reset_log (
  id             uuid primary key default gen_random_uuid(),
  discipline_id  uuid not null references disciplines(id) on delete cascade,
  streak_reached integer not null,
  note           text,
  run_start      timestamptz not null,
  reset_at       timestamptz not null default now(),

  constraint reset_note_len check (note is null or char_length(note) <= 1200)
);
create index if not exists reset_log_discipline_idx on reset_log(discipline_id, reset_at desc);

-- ------------------------------------------------------------
--  5. Per-streak journal. One thread per streak: how it's going,
--     what triggered a slip, what to watch for.
-- ------------------------------------------------------------

create table if not exists chat_messages (
  id            uuid primary key default gen_random_uuid(),
  discipline_id uuid not null references disciplines(id) on delete cascade,
  user_id       text not null references "user"("id") on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now(),

  constraint chat_len check (char_length(body) between 1 and 4000)
);
create index if not exists chat_discipline_idx on chat_messages(discipline_id, created_at desc);

-- ------------------------------------------------------------
--  6. Cached AI output. Groq's free tier is rate limited per
--     organisation, so generated insights are stored and reused
--     rather than regenerated on every page view.
-- ------------------------------------------------------------

create table if not exists ai_insights (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references "user"("id") on delete cascade,
  discipline_id uuid references disciplines(id) on delete cascade,
  kind          text not null,
  content       text not null,
  created_at    timestamptz not null default now(),

  constraint insight_kind_valid check (kind in ('pattern', 'weekly', 'postmortem'))
);
create index if not exists ai_insights_lookup_idx
  on ai_insights(user_id, kind, created_at desc);

-- ------------------------------------------------------------
--  7. Sent-email ledger. The milestone cron is only safe to
--     re-run because of this: one row per (streak, milestone),
--     enforced by a unique index, so a retry or an overlapping
--     run can never send the same congratulation twice.
-- ------------------------------------------------------------

create table if not exists email_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references "user"("id") on delete cascade,
  discipline_id uuid references disciplines(id) on delete cascade,
  kind          text not null,
  -- Milestone emails: the day number crossed. Weekly review: the
  -- ISO week key, e.g. 2026-W38.
  marker        text not null,
  sent_at       timestamptz not null default now(),

  constraint email_kind_valid check (kind in ('milestone', 'sprint_complete', 'weekly'))
);
create unique index if not exists email_log_once_idx
  on email_log(user_id, coalesce(discipline_id::text, ''), kind, marker);
