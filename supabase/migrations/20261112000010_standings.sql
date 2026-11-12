-- League table, kept by hand. One row per team per season; order is points desc, then sort_order (manual tie-break).
create table public.standings (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  team text not null check (length(trim(team)) > 0),
  points smallint not null default 0 check (points >= 0),
  sort_order smallint not null default 0,
  is_us boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, team)
);
create index standings_season on public.standings (season_id, points desc, sort_order);
create unique index standings_one_us on public.standings (season_id) where is_us;
create trigger set_updated_at before update on public.standings
  for each row execute function public.set_updated_at();

alter table public.standings enable row level security;
revoke all on public.standings from anon;
create policy standings_select on public.standings for select to authenticated
  using ((select public.has_role('admin', 'staff', 'player', 'viewer')));
create policy standings_staff_write on public.standings for all to authenticated
  using ((select public.has_role('admin', 'staff'))) with check ((select public.has_role('admin', 'staff')));
