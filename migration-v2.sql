-- Run this against your EXISTING database (the one you already set up
-- and have real data in). Paste into Neon's SQL Editor and run once.

create extension if not exists "pgcrypto";

alter table disciplines drop column if exists color;
alter table disciplines add column if not exists public_token text not null default gen_random_uuid()::text;
