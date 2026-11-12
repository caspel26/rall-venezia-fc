begin;
create extension if not exists pgtap with schema extensions;
select plan(39);

-- seed ids
\set admin '''a0000000-0000-4000-8000-000000000001'''
\set staff '''a0000000-0000-4000-8000-000000000002'''
\set player '''a0000000-0000-4000-8000-000000000003'''
\set viewer '''a0000000-0000-4000-8000-000000000004'''

create function pg_temp.as_user(uid text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true),
         set_config('role', 'authenticated', true);
$$;
create function pg_temp.as_anon() returns void language sql as $$
  select set_config('request.jwt.claims', '{"role":"anon"}', true), set_config('role', 'anon', true);
$$;

create function pg_temp.rows_changed(q text) returns int language plpgsql as $$
declare n int;
begin execute q; get diagnostics n = row_count; return n; end $$;

-- every public table has RLS
select is(
  (select count(*)::int from pg_tables t join pg_class c on c.relname = t.tablename
    where t.schemaname = 'public' and c.relnamespace = 'public'::regnamespace and not c.relrowsecurity),
  0, 'RLS is enabled on every public table');

-- anon sees nothing
select pg_temp.as_anon();
select throws_ok($$select * from public.matches$$, '42501', null, 'anon cannot read matches');
select throws_ok($$select * from public.players$$, '42501', null, 'anon cannot read players');
reset role;

-- viewer
select pg_temp.as_user(:viewer);
select cmp_ok((select count(*)::int from public.matches), '>', 0, 'viewer reads matches');
select cmp_ok((select count(*)::int from public.goals), '>', 0, 'viewer reads goals');
select is((select count(*)::int from public.availability), 0, 'viewer sees no availability');
select is((select count(*)::int from public.announcements), 0, 'viewer sees no announcements');
select throws_ok($$insert into public.seasons (name, starts_on) values ('X', now())$$, '42501', null, 'viewer cannot write');
select is((select count(*)::int from public.user_roles), 1, 'viewer sees only their own role row');
select cmp_ok((select count(*)::int from public.news_articles), '>', 0, 'viewer reads published news');
select is((select count(*)::int from public.staff_members), 3, 'viewer reads the staff');
select is((select count(*)::int from public.polls), 0, 'viewer sees no polls');
select is((select count(*)::int from public.standings), 20, 'viewer reads the league table');
select throws_ok($$insert into public.news_articles (slug, title, body) values ('x', 'x', 'x')$$, '42501', null, 'viewer cannot write news');
reset role;

-- player
select pg_temp.as_user(:player);
select throws_ok($$insert into public.news_articles (slug, title, body) values ('x', 'x', 'x')$$, '42501', null, 'player cannot write news');
select throws_ok($$insert into public.staff_members (slug, first_name, last_name, role_title) values ('x', 'x', 'x', 'x')$$, '42501', null, 'player cannot write staff');
select is(pg_temp.rows_changed($$update public.standings set points = 99$$), 0, 'player cannot change the league table');
select lives_ok($$select public.set_poll_votes('e0000000-0000-4000-8000-000000000001',
  array[(date_trunc('week', now() + interval '7 days'))::date, (date_trunc('week', now() + interval '7 days'))::date + 1])$$, 'player votes for several days');
select is((select count(*)::int from public.poll_votes where player_id = 'c0000000-0000-4000-8000-000000000001'), 2, 'both days are stored');
select throws_ok($$select public.set_poll_votes('e0000000-0000-4000-8000-000000000001',
  array[(date_trunc('week', now() + interval '7 days'))::date + 5])$$, 'P0001', 'day_out_of_range', 'weekend days are refused');
select throws_ok($$insert into public.poll_votes (poll_id, player_id, day) values ('e0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', (date_trunc('week', now() + interval '7 days'))::date)
  on conflict do nothing$$, '42501', null, 'player cannot vote for a teammate');
select is((select count(*)::int from public.announcements), 2, 'player reads published announcements');
select is(pg_temp.rows_changed($$update public.players set nickname = 'x'$$), 0, 'player update of players affects no rows');
select lives_ok($$select public.set_availability('d0000000-0000-4000-8000-000000000004', 'maybe')$$, 'player answers own availability');
select is((select status from public.availability where match_id = 'd0000000-0000-4000-8000-000000000004'
  and player_id = 'c0000000-0000-4000-8000-000000000001'), 'maybe', 'answer is stored');
select throws_ok($$insert into public.availability (match_id, player_id, status)
  values ('d0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000002', 'available')
  on conflict (match_id, player_id) do update set status = 'available'$$, '42501', null, 'player cannot answer for a teammate');
select throws_ok($$select public.set_availability('d0000000-0000-4000-8000-000000000001', 'available')$$, '42501', null, 'no answer after kickoff');
select is(pg_temp.rows_changed($$delete from public.availability where match_id = 'd0000000-0000-4000-8000-000000000001'$$), 0, 'a player cannot delete a past answer');
select throws_ok($$select public.record_match_result('d0000000-0000-4000-8000-000000000004', 1, 0, '[]', '[]', null)$$, '42501', null, 'player cannot record results');
select is(pg_temp.rows_changed($$update public.user_roles set role = 'admin'$$), 0, 'player role update affects no rows');
reset role;

-- staff
select pg_temp.as_user(:staff);
select lives_ok($$update public.players set nickname = 'Muro' where slug = 'daniele-nappo'$$, 'staff edits players');
select is(pg_temp.rows_changed($$update public.standings set points = points where team = 'Lazio'$$), 1, 'staff edits the league table');
select throws_ok($$insert into public.players (slug, first_name, last_name, profile_id) values ('x-y', 'X', 'Y', 'a0000000-0000-4000-8000-000000000004')$$, '42501', null, 'staff cannot link an account when adding a player');
select throws_ok($$insert into public.news_articles (slug, title, body, external_url) values ('xx', 'x', 'x', 'javascript:alert(1)')$$, '23514', null, 'external_url must be an Instagram https link');
select throws_ok($$update public.players set profile_id = null where slug = 'daniele-nappo'$$, '42501', null, 'staff cannot unlink accounts');
select throws_ok($$select public.record_match_result('d0000000-0000-4000-8000-000000000004', 1, 0,
  '[{"player_id":"c0000000-0000-4000-8000-000000000001","is_starter":true}]',
  '[{"scorer_id":"c0000000-0000-4000-8000-000000000001"},{"scorer_id":"c0000000-0000-4000-8000-000000000001"}]', null)$$,
  'P0001', 'goals_exceed_score', 'recorded goals cannot exceed the score');
reset role;

-- admin and last-admin protection
select pg_temp.as_user(:admin);
select lives_ok($$update public.players set profile_id = null where slug = 'daniele-nappo'$$, 'admin can unlink accounts');
reset role;
select throws_ok($$update public.user_roles set role = 'staff' where user_id = 'a0000000-0000-4000-8000-000000000001'$$,
  'P0001', 'last_admin', 'last admin cannot be demoted');

-- derived stats
select results_eq($$select played, wins, draws, losses, goals_for, goals_against from public.team_season_stats$$,
  $$values (8, 5, 1, 2, 62, 37)$$, 'team season record matches the seed');

select * from finish();
rollback;
