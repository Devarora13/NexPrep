-- Run this in the Supabase SQL editor before using the VERITUS career profile feature.
create table if not exists public."CareerProfiles" (
  id uuid primary key default gen_random_uuid(),
  user_email text not null unique,
  target_role text not null,
  job_description text,
  resume_text text not null,
  analysis jsonb not null default '{}'::jsonb,
  analysis_source text not null default 'local',
  updated_at timestamptz not null default now()
);

alter table public."CareerProfiles" enable row level security;

drop policy if exists "Users can manage their own career profile" on public."CareerProfiles";
create policy "Users can manage their own career profile"
on public."CareerProfiles"
for all
using (auth.jwt() ->> 'email' = user_email)
with check (auth.jwt() ->> 'email' = user_email);
