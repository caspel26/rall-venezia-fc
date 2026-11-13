-- "TANTI": a player whose assists were not counted but are known to be many. The UI shows the word instead of a number.
alter table public.player_stat_baselines add column assists_many boolean not null default false;

create or replace view public.player_season_stats with (security_invoker = true) as
with played as (
  select mp.player_id, m.season_id, m.rv_score, m.opp_score
  from public.match_players mp
  join public.matches m on m.id = mp.match_id
  where m.status = 'completed'
),
derived as (
  select player_id, season_id, count(*)::int as apps, count(*) filter (where rv_score > opp_score)::int as wins
  from played group by player_id, season_id
),
keys as (
  select player_id, season_id from derived
  union
  select player_id, season_id from public.player_stat_baselines
),
season_matches as (
  select season_id, count(*)::int as n from public.matches where status = 'completed' group by season_id
),
agg as (
  select k.player_id, k.season_id,
    coalesce(d.apps, 0) as apps, coalesce(d.wins, 0) as wins,
    coalesce(b.appearances, 0) as base_apps,
    coalesce(b.assists_many, false) as assists_many,
    (select count(*) from public.goals g join public.matches m on m.id = g.match_id
      where g.scorer_id = k.player_id and m.season_id = k.season_id and m.status = 'completed')::int + coalesce(b.goals, 0) as goals,
    (select count(*) from public.goals g join public.matches m on m.id = g.match_id
      where g.assist_id = k.player_id and m.season_id = k.season_id and m.status = 'completed')::int + coalesce(b.assists, 0) as assists,
    (select count(*) from public.mvp_awards a join public.matches m on m.id = a.match_id
      where a.player_id = k.player_id and m.season_id = k.season_id)::int as mvps
  from keys k
  left join derived d using (player_id, season_id)
  left join public.player_stat_baselines b using (player_id, season_id)
)
select
  a.player_id,
  a.season_id,
  (a.apps + a.base_apps)::int as appearances,
  a.wins::int as wins,
  a.goals::int as goals,
  a.assists::int as assists,
  a.mvps,
  round(a.goals::numeric / nullif(a.apps + a.base_apps, 0), 2) as goals_per_game,
  round((a.apps + a.base_apps)::numeric / nullif((select n from season_matches sm where sm.season_id = a.season_id), 0), 2) as attendance,
  a.assists_many
from agg a;

create or replace view public.player_career_stats with (security_invoker = true) as
select
  s.player_id,
  sum(s.appearances)::int as appearances,
  sum(s.wins)::int as wins,
  sum(s.goals)::int as goals,
  sum(s.assists)::int as assists,
  sum(s.mvps)::int as mvps,
  round(sum(s.goals)::numeric / nullif(sum(s.appearances), 0), 2) as goals_per_game,
  round(sum(s.appearances)::numeric
    / nullif((select count(*) from public.matches where status = 'completed'), 0), 2) as attendance,
  bool_or(s.assists_many) as assists_many
from public.player_season_stats s
group by s.player_id;

