-- Rall Venezia Clubhouse: core schema. See docs/DATABASE.md.

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- identity

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin', 'staff', 'player', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- reference data

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  starts_on date not null,
  ends_on date,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index seasons_one_current on public.seasons (is_current) where is_current;

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.opponents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  logo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  first_name text not null,
  last_name text not null,
  nickname text,
  shirt_number smallint check (shirt_number between 0 and 99),
  position text check (position in ('goalkeeper', 'defender', 'winger', 'midfielder', 'pivot')),
  is_captain boolean not null default false,
  photo_path text,
  avatar_path text,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index players_active_number on public.players (shirt_number)
  where is_active and shirt_number is not null;
create unique index players_one_captain on public.players (is_captain)
  where is_captain and is_active;

-- ---------------------------------------------------------------- matches

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id),
  competition_id uuid references public.competitions (id),
  opponent_id uuid not null references public.opponents (id),
  is_home boolean not null default true,
  kickoff_at timestamptz not null,
  venue text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'live', 'completed', 'postponed', 'cancelled')),
  rv_score smallint check (rv_score >= 0),
  opp_score smallint check (opp_score >= 0),
  notes text,
  graphic_path text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_completed_has_score
    check (status <> 'completed' or (rv_score is not null and opp_score is not null))
);
create index matches_season_kickoff on public.matches (season_id, kickoff_at desc);
create index matches_status_kickoff on public.matches (status, kickoff_at);
create index matches_opponent on public.matches (opponent_id);
create index matches_competition on public.matches (competition_id);

create table public.match_players (
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id),
  is_starter boolean not null default false,
  minutes smallint check (minutes >= 0),
  created_at timestamptz not null default now(),
  primary key (match_id, player_id)
);
create index match_players_player on public.match_players (player_id);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  scorer_id uuid references public.players (id),
  assist_id uuid references public.players (id),
  minute smallint check (minute between 0 and 120),
  is_own_goal boolean not null default false,
  created_at timestamptz not null default now(),
  constraint goals_scorer_or_own_goal check (
    (is_own_goal and scorer_id is null and assist_id is null)
    or (not is_own_goal and scorer_id is not null)
  ),
  constraint goals_assist_not_scorer check (assist_id is null or assist_id <> scorer_id)
);
create index goals_match on public.goals (match_id);
create index goals_scorer on public.goals (scorer_id);
create index goals_assist on public.goals (assist_id);

create table public.mvp_awards (
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id),
  created_at timestamptz not null default now(),
  primary key (match_id, player_id)
);
create index mvp_awards_player on public.mvp_awards (player_id);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id),
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  score numeric(3, 1) not null check (score between 0 and 10),
  review text,
  attributes text[] not null default '{}' check (cardinality(attributes) <= 4),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, player_id)
);
create index ratings_player on public.ratings (player_id);

create table public.availability (
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id),
  status text not null check (status in ('available', 'unavailable', 'maybe')),
  responded_at timestamptz not null default now(),
  primary key (match_id, player_id)
);
create index availability_player on public.availability (player_id);

-- ---------------------------------------------------------------- content

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  title text not null,
  body text not null,
  pinned boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index announcements_published on public.announcements (published_at desc);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  kind text not null check (kind in ('photo', 'graphic', 'pagella', 'meme', 'video', 'announcement')),
  title text,
  match_id uuid references public.matches (id) on delete set null,
  player_id uuid references public.players (id) on delete set null,
  season_id uuid references public.seasons (id) on delete set null,
  min_role text not null default 'player' check (min_role in ('viewer', 'player')),
  uploaded_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (bucket, path)
);
create index media_match on public.media (match_id);
create index media_player on public.media (player_id);
create index media_season on public.media (season_id);

create table public.mascot (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_path text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['profiles', 'user_roles', 'seasons', 'competitions', 'opponents', 'players',
    'matches', 'ratings', 'announcements', 'mascot']
  loop
    execute format('create trigger set_updated_at before update on public.%I
      for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- roles

-- Role lookup used by every policy. Security definer so policies can read user_roles
-- without granting it; search_path is pinned so it cannot be hijacked.
create function public.has_role(variadic roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = any (roles)
  );
$$;
revoke all on function public.has_role(text[]) from public, anon;
grant execute on function public.has_role(text[]) to authenticated;

-- New auth user => profile + least-privilege role. The role is raised later by an admin only.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
  insert into public.user_roles (user_id, role) values (new.id, 'viewer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- The last admin can neither be demoted nor removed.
create function public.protect_last_admin() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.role = 'admin' and (tg_op = 'DELETE' or new.role <> 'admin')
     and not exists (select 1 from public.user_roles where role = 'admin' and user_id <> old.user_id) then
    raise exception 'last_admin' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;
create trigger protect_last_admin before update or delete on public.user_roles
  for each row execute function public.protect_last_admin();

-- Only admins may link or unlink a player to an account.
create function public.guard_player_link() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.profile_id is distinct from old.profile_id and (select auth.uid()) is not null
     and not public.has_role('admin') then
    raise exception 'admin_only_link' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger guard_player_link before update on public.players
  for each row execute function public.guard_player_link();

-- ---------------------------------------------------------------- views (caller's RLS applies)

create view public.assists with (security_invoker = true) as
  select id as goal_id, match_id, assist_id as player_id, scorer_id, minute
  from public.goals where assist_id is not null;

create view public.player_season_stats with (security_invoker = true) as
with played as (
  select mp.player_id, m.season_id, m.id as match_id, m.rv_score, m.opp_score
  from public.match_players mp
  join public.matches m on m.id = mp.match_id
  where m.status = 'completed'
),
season_matches as (
  select season_id, count(*)::int as n from public.matches where status = 'completed' group by season_id
)
select
  p.player_id,
  p.season_id,
  count(*)::int as appearances,
  count(*) filter (where p.rv_score > p.opp_score)::int as wins,
  (select count(*) from public.goals g join public.matches m on m.id = g.match_id
    where g.scorer_id = p.player_id and m.season_id = p.season_id and m.status = 'completed')::int as goals,
  (select count(*) from public.goals g join public.matches m on m.id = g.match_id
    where g.assist_id = p.player_id and m.season_id = p.season_id and m.status = 'completed')::int as assists,
  (select count(*) from public.mvp_awards a join public.matches m on m.id = a.match_id
    where a.player_id = p.player_id and m.season_id = p.season_id)::int as mvps,
  (select round(avg(r.score), 2) from public.ratings r join public.matches m on m.id = r.match_id
    where r.player_id = p.player_id and m.season_id = p.season_id and r.published) as avg_rating,
  round((select count(*) from public.goals g join public.matches m on m.id = g.match_id
    where g.scorer_id = p.player_id and m.season_id = p.season_id and m.status = 'completed')::numeric
    / count(*), 2) as goals_per_game,
  round(count(*)::numeric / nullif((select n from season_matches sm where sm.season_id = p.season_id), 0), 2) as attendance
from played p
group by p.player_id, p.season_id;

create view public.player_career_stats with (security_invoker = true) as
select
  s.player_id,
  sum(s.appearances)::int as appearances,
  sum(s.wins)::int as wins,
  sum(s.goals)::int as goals,
  sum(s.assists)::int as assists,
  sum(s.mvps)::int as mvps,
  (select round(avg(r.score), 2) from public.ratings r where r.player_id = s.player_id and r.published) as avg_rating,
  round(sum(s.goals)::numeric / nullif(sum(s.appearances), 0), 2) as goals_per_game,
  round(sum(s.appearances)::numeric
    / nullif((select count(*) from public.matches where status = 'completed'), 0), 2) as attendance
from public.player_season_stats s
group by s.player_id;

create view public.player_rating_summary with (security_invoker = true) as
select
  player_id,
  count(*)::int as ratings_count,
  round(avg(score), 2) as avg_score,
  max(score) as best_score,
  min(score) as worst_score
from public.ratings
where published
group by player_id;

create view public.team_season_stats with (security_invoker = true) as
select
  season_id,
  count(*)::int as played,
  count(*) filter (where rv_score > opp_score)::int as wins,
  count(*) filter (where rv_score = opp_score)::int as draws,
  count(*) filter (where rv_score < opp_score)::int as losses,
  sum(rv_score)::int as goals_for,
  sum(opp_score)::int as goals_against,
  (sum(rv_score) - sum(opp_score))::int as goal_difference
from public.matches
where status = 'completed'
group by season_id;

create view public.match_result_issues with (security_invoker = true) as
select m.id as match_id, m.rv_score, count(g.id)::int as recorded_goals
from public.matches m
left join public.goals g on g.match_id = m.id
where m.status = 'completed'
group by m.id, m.rv_score
having count(g.id) > m.rv_score;

-- ---------------------------------------------------------------- RPC (security invoker: RLS applies)

-- Atomic post-match write. p_lineup: [{player_id, is_starter, minutes}],
-- p_goals: [{scorer_id, assist_id, minute, is_own_goal}].
create function public.record_match_result(
  p_match_id uuid, p_rv_score int, p_opp_score int,
  p_lineup jsonb, p_goals jsonb, p_mvp_ids uuid[]
) returns void
language plpgsql set search_path = '' as $$
declare
  n_goals int;
  stray int;
begin
  if not public.has_role('admin', 'staff') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_rv_score < 0 or p_opp_score < 0 then
    raise exception 'invalid_score' using errcode = 'P0001';
  end if;

  update public.matches
     set rv_score = p_rv_score, opp_score = p_opp_score, status = 'completed'
   where id = p_match_id;
  if not found then
    raise exception 'match_not_found' using errcode = 'P0002';
  end if;

  delete from public.match_players where match_id = p_match_id;
  delete from public.goals where match_id = p_match_id;
  delete from public.mvp_awards where match_id = p_match_id;

  insert into public.match_players (match_id, player_id, is_starter, minutes)
  select p_match_id, (e ->> 'player_id')::uuid, coalesce((e ->> 'is_starter')::boolean, false),
         (e ->> 'minutes')::smallint
  from jsonb_array_elements(coalesce(p_lineup, '[]'::jsonb)) e;

  insert into public.goals (match_id, scorer_id, assist_id, minute, is_own_goal)
  select p_match_id, (e ->> 'scorer_id')::uuid, (e ->> 'assist_id')::uuid, (e ->> 'minute')::smallint,
         coalesce((e ->> 'is_own_goal')::boolean, false)
  from jsonb_array_elements(coalesce(p_goals, '[]'::jsonb)) e;

  select count(*) into n_goals from public.goals where match_id = p_match_id;
  if n_goals > p_rv_score then
    raise exception 'goals_exceed_score' using errcode = 'P0001';
  end if;

  select count(*) into stray from public.goals g
   where g.match_id = p_match_id
     and ((g.scorer_id is not null and not exists
            (select 1 from public.match_players mp where mp.match_id = g.match_id and mp.player_id = g.scorer_id))
       or (g.assist_id is not null and not exists
            (select 1 from public.match_players mp where mp.match_id = g.match_id and mp.player_id = g.assist_id)));
  if stray > 0 then
    raise exception 'scorer_not_in_lineup' using errcode = 'P0001';
  end if;

  if p_mvp_ids is not null then
    insert into public.mvp_awards (match_id, player_id)
    select p_match_id, x from unnest(p_mvp_ids) x;
    if exists (select 1 from public.mvp_awards a where a.match_id = p_match_id and not exists
        (select 1 from public.match_players mp where mp.match_id = a.match_id and mp.player_id = a.player_id)) then
      raise exception 'mvp_not_in_lineup' using errcode = 'P0001';
    end if;
  end if;
end $$;

-- A player answers for themself, only before kickoff.
create function public.set_availability(p_match_id uuid, p_status text) returns void
language plpgsql set search_path = '' as $$
declare pid uuid;
begin
  select id into pid from public.players where profile_id = (select auth.uid());
  if pid is null then
    raise exception 'no_player' using errcode = 'P0001';
  end if;
  insert into public.availability (match_id, player_id, status, responded_at)
  values (p_match_id, pid, p_status, now())
  on conflict (match_id, player_id) do update set status = excluded.status, responded_at = now();
end $$;
grant execute on function public.record_match_result(uuid, int, int, jsonb, jsonb, uuid[]) to authenticated;
grant execute on function public.set_availability(uuid, text) to authenticated;
revoke execute on function public.record_match_result(uuid, int, int, jsonb, jsonb, uuid[]) from public, anon;
revoke execute on function public.set_availability(uuid, text) from public, anon;
