begin;

create table if not exists public."PracticeCredits" (
  user_email text not null,
  event text not null,
  amount integer not null check (amount in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (user_email, event)
);
alter table public."PracticeCredits" enable row level security;
revoke all on public."PracticeCredits" from public, anon, authenticated;
grant select on public."PracticeCredits" to authenticated;
drop policy if exists "Read own practice credits" on public."PracticeCredits";
create policy "Read own practice credits" on public."PracticeCredits" for select
to authenticated using (user_email = (select auth.jwt() ->> 'email'));

create or replace function public.practice_credit(p_event text)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  email_address text := auth.jwt() ->> 'email';
  balance integer;
  delta integer := 1;
  qualified boolean := false;
begin
  select coalesce(u.credits,0) into balance from public."Users" u where u.email = email_address for update;
  if not found then raise exception 'Sign in to your VERITUS account.'; end if;
  if exists (select 1 from public."PracticeCredits" where user_email=email_address and event=p_event) then return balance; end if;

  if p_event in ('quantitative','logical') then
    select exists(select 1 from public."AssessmentAttempts" a where a.user_email=email_address
      and a.assessment_type=p_event and a.answers->'submission' = case p_event
        when 'quantitative' then '[2,0,3,1,1,2,0,3,1,2]'::jsonb
        else '[3,1,2,3,1,1,2,3,1,1]'::jsonb end) into qualified;
  elsif p_event='learning' then
    select count(distinct a.assessment_type)=3 into qualified from public."AssessmentAttempts" a
      where a.user_email=email_address and (a.assessment_type, a.answers->'submission') in
      (('star','[2]'::jsonb),('resume','[2]'::jsonb),('testing','[1]'::jsonb));
  elsif p_event='advanced-case' then
    if balance < 1 then raise exception 'Earn a credit before unlocking this case.'; end if;
    qualified := true;
    delta := -1;
  else raise exception 'Unknown credit event.';
  end if;

  if not qualified then raise exception 'Complete the required practice first.'; end if;
  insert into public."PracticeCredits"(user_email,event,amount) values (email_address,p_event,delta);
  update public."Users" set credits=balance+delta where email=email_address;
  return balance+delta;
end;
$$;

create or replace function public.advanced_practice_case()
returns text language sql stable security invoker set search_path = '' as $$
  select 'Design a placement portal that alerts students when a relevant opening arrives. It serves 5,000 students and must avoid duplicate alerts. In five minutes, sketch the data model and explain how you would recover after an email failure. Then explain how you would test duplicate prevention and how you would measure delivery latency. Rate your answer on assumptions, failure recovery and measurable outcomes.'
  where exists(select 1 from public."PracticeCredits" where user_email=auth.jwt()->>'email' and event='advanced-case')
$$;
revoke all on function public.practice_credit(text), public.advanced_practice_case() from public, anon;
grant execute on function public.practice_credit(text), public.advanced_practice_case() to authenticated;
commit;
