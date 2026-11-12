begin;
create extension if not exists pgtap with schema extensions;
select plan(27);

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
select is((select count(*)::int from public.ratings), 0, 'viewer sees no ratings');
select is((select count(*)::int from public.availability), 0, 'viewer sees no availability');
select is((select count(*)::int from public.announcements), 0, 'viewer sees no announcements');
select throws_ok($$insert into public.seasons (name, starts_on) values ('X', now())$$, '42501', null, 'viewer cannot write');
select is((select count(*)::int from public.user_roles), 1, 'viewer sees only their own role row');
reset role;

-- player
select pg_temp.as_user(:player);
select is((select count(*)::int from public.ratings where not published), 0, 'player sees no draft ratings');
select cmp_ok((select count(*)::int from public.ratings), '>', 0, 'player reads published ratings');
select is((select count(*)::int from public.announcements), 2, 'player reads published announcements');
select is(pg_temp.rows_changed($$update public.players set nickname = 'x'$$), 0, 'player update of players affects no rows');
select lives_ok($$select public.set_availability('d0000000-0000-4000-8000-000000000004', 'maybe')$$, 'player answers own availability');
select is((select status from public.availability where match_id = 'd0000000-0000-4000-8000-000000000004'
  and player_id = 'c0000000-0000-4000-8000-000000000001'), 'maybe', 'answer is stored');
select throws_ok($$insert into public.availability (match_id, player_id, status)
  values ('d0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000002', 'available')
  on conflict (match_id, player_id) do update set status = 'available'$$, '42501', null, 'player cannot answer for a teammate');
select throws_ok($$select public.set_availability('d0000000-0000-4000-8000-000000000001', 'available')$$, '42501', null, 'no answer after kickoff');
select throws_ok($$select public.record_match_result('d0000000-0000-4000-8000-000000000004', 1, 0, '[]', '[]', null)$$, '42501', null, 'player cannot record results');
select is(pg_temp.rows_changed($$update public.user_roles set role = 'admin'$$), 0, 'player role update affects no rows');
reset role;

-- staff
select pg_temp.as_user(:staff);
select cmp_ok((select count(*)::int from public.ratings where not published), '>', 0, 'staff sees draft ratings');
select lives_ok($$update public.players set nickname = 'Muro' where slug = 'daniele-nappo'$$, 'staff edits players');
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
  $$values (3, 1, 1, 1, 17, 13)$$, 'team season record matches the seed');

select * from finish();
rollback;
