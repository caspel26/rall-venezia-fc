-- Staff (coach, social media manager, ...): shown on the squad page. Not players: no number, no stats.
create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  first_name text not null,
  last_name text not null,
  role_title text not null,
  photo_path text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.staff_members
  for each row execute function public.set_updated_at();

alter table public.staff_members enable row level security;
revoke all on public.staff_members from anon;
create policy staff_members_select on public.staff_members for select to authenticated
  using ((select public.has_role('admin', 'staff', 'player', 'viewer')));
create policy staff_members_admin_write on public.staff_members for all to authenticated
  using ((select public.has_role('admin'))) with check ((select public.has_role('admin')));
