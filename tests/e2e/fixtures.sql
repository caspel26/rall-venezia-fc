-- Test-only fixtures: two upcoming matches (the real calendar is still to be designated, so the seed has none).
-- Idempotent: applied by tests/e2e/global-setup.ts before every run.
delete from public.matches where id in ('d0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000005');
insert into public.opponents (id, name, short_name) values
  ('b2000000-0000-4000-8000-000000000004', 'Real Mestre', 'MES'),
  ('b2000000-0000-4000-8000-000000000005', 'Burano Boys', 'BUR')
on conflict (id) do nothing;
insert into public.matches (id, season_id, competition_id, opponent_id, is_home, kickoff_at, venue, status) values
  ('d0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', true,  date_trunc('day', now()) + interval '4 days 19 hours', 'Palazzetto Venezia', 'scheduled'),
  ('d0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000005', false, date_trunc('day', now()) + interval '11 days 19 hours', 'Campo di Burano', 'scheduled');
insert into public.availability (match_id, player_id, status)
select 'd0000000-0000-4000-8000-000000000004', p.id, v.status
from (values ('antonio-verrone', 'available'), ('alfonso-avino', 'available'), ('salvatore-marigliano', 'available'),
             ('sergio-batti', 'maybe'), ('raffaele-miranda', 'unavailable')) as v(slug, status)
join public.players p on p.slug = v.slug;
