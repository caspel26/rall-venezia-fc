-- Pagelle (ratings) were removed from the product. Drop the table and every view that used it.
drop view public.player_career_stats;
drop view public.player_season_stats;
drop view public.player_rating_summary;
drop table public.ratings;

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
  round(sum(s.goals)::numeric / nullif(sum(s.appearances), 0), 2) as goals_per_game,
  round(sum(s.appearances)::numeric
    / nullif((select count(*) from public.matches where status = 'completed'), 0), 2) as attendance
from public.player_season_stats s
group by s.player_id;

grant select on public.player_season_stats, public.player_career_stats to authenticated;
