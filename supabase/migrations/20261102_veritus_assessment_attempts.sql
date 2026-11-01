create table if not exists public."AssessmentAttempts" (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  assessment_type text not null,
  score integer not null check (score between 0 and 100),
  total_questions integer not null check (total_questions > 0),
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public."AssessmentAttempts" enable row level security;

drop policy if exists "Users can manage their own assessment attempts" on public."AssessmentAttempts";
create policy "Users can manage their own assessment attempts"
on public."AssessmentAttempts"
for all
using (auth.jwt() ->> 'email' = user_email)
with check (auth.jwt() ->> 'email' = user_email);
