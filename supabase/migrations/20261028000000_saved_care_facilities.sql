-- Only a provider ID and its owner are stored; no review text, profiles, or preferences.
create table public.saved_care_facilities (
  user_id uuid not null references auth.users(id) on delete cascade,
  facility_id text not null check (length(facility_id) between 1 and 255 and facility_id = btrim(facility_id)),
  created_at timestamptz not null default now(),
  primary key (user_id, facility_id)
);

alter table public.saved_care_facilities enable row level security;
revoke all on public.saved_care_facilities from public, anon, authenticated;
grant select, insert, delete on public.saved_care_facilities to authenticated;

create policy "Read own saved care facilities" on public.saved_care_facilities
  for select to authenticated using ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');
create policy "Save own care facilities" on public.saved_care_facilities
  for insert to authenticated with check ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');
create policy "Remove own saved care facilities" on public.saved_care_facilities
  for delete to authenticated using ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');
