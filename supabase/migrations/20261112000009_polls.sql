-- Weekly availability poll (Mon-Fri), created the day after a match. Players pick any number of days.
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique check (extract(isodow from week_start) = 1), -- always a Monday
  closes_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.poll_votes (
  poll_id uuid not null references public.polls (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (poll_id, player_id, day)
);
create index poll_votes_player on public.poll_votes (player_id);

alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
revoke all on public.polls, public.poll_votes from anon;

create policy polls_select on public.polls for select to authenticated
  using ((select public.has_role('admin', 'staff', 'player')));
create policy polls_staff_write on public.polls for all to authenticated
  using ((select public.has_role('admin', 'staff'))) with check ((select public.has_role('admin', 'staff')));

create policy poll_votes_select on public.poll_votes for select to authenticated
  using ((select public.has_role('admin', 'staff', 'player')));
create policy poll_votes_staff_write on public.poll_votes for all to authenticated
  using ((select public.has_role('admin', 'staff'))) with check ((select public.has_role('admin', 'staff')));
-- a player writes only their own votes, only while the poll is open
create policy poll_votes_own_write on public.poll_votes for all to authenticated
  using ((select public.has_role('player'))
    and player_id in (select id from public.players where profile_id = (select auth.uid()))
    and exists (select 1 from public.polls p where p.id = poll_id and p.closes_at > now()))
  with check ((select public.has_role('player'))
    and player_id in (select id from public.players where profile_id = (select auth.uid()))
    and exists (select 1 from public.polls p where p.id = poll_id and p.closes_at > now()));

-- Replace my votes for a poll with exactly these days (any subset of Mon-Fri of that week).
create function public.set_poll_votes(p_poll_id uuid, p_days date[]) returns void
language plpgsql set search_path = '' as $$
declare
  pid uuid;
  wk date;
begin
  select id into pid from public.players where profile_id = (select auth.uid());
  if pid is null then raise exception 'no_player' using errcode = 'P0001'; end if;
  select week_start into wk from public.polls where id = p_poll_id and closes_at > now();
  if wk is null then raise exception 'poll_closed' using errcode = 'P0001'; end if;
  if exists (select 1 from unnest(p_days) d where d < wk or d > wk + 4) then
    raise exception 'day_out_of_range' using errcode = 'P0001';
  end if;
  delete from public.poll_votes where poll_id = p_poll_id and player_id = pid;
  insert into public.poll_votes (poll_id, player_id, day)
  select p_poll_id, pid, d from unnest(coalesce(p_days, '{}')) d group by d;
end $$;
revoke execute on function public.set_poll_votes(uuid, date[]) from public, anon;
grant execute on function public.set_poll_votes(uuid, date[]) to authenticated;
