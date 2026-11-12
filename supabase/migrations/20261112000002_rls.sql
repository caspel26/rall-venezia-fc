-- Row Level Security. Default deny; see docs/AUTHORIZATION.md.
-- Role sets: staff_up = admin+staff, player_up = admin+staff+player, any = all four roles.

-- anon never touches data
revoke all on all tables in schema public from anon;
revoke all on all functions in schema public from anon;
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on functions from anon;

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- profiles: own row, or staff/admin. Players edit only their display name.
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.has_role('admin', 'staff')));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_admin_all on public.profiles for all to authenticated
  using ((select public.has_role('admin'))) with check ((select public.has_role('admin')));
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

-- user_roles: read own; writes only by admin (the server route additionally uses the service role)
create policy user_roles_select on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select public.has_role('admin')));
create policy user_roles_admin_write on public.user_roles for all to authenticated
  using ((select public.has_role('admin'))) with check ((select public.has_role('admin')));

-- reference data and squad: everyone reads, staff writes
do $$
declare t text;
begin
  foreach t in array array['players', 'seasons', 'competitions', 'opponents']
  loop
    execute format('create policy %I on public.%I for select to authenticated
      using ((select public.has_role(''admin'', ''staff'', ''player'', ''viewer'')))', t || '_select', t);
    execute format('create policy %I on public.%I for all to authenticated
      using ((select public.has_role(''admin'', ''staff''))) with check ((select public.has_role(''admin'', ''staff'')))',
      t || '_staff_write', t);
  end loop;
end $$;

-- matches: published rows for every role, drafts for staff
create policy matches_select on public.matches for select to authenticated
  using ((select public.has_role('admin', 'staff', 'player', 'viewer'))
         and (published or (select public.has_role('admin', 'staff'))));
create policy matches_staff_write on public.matches for all to authenticated
  using ((select public.has_role('admin', 'staff'))) with check ((select public.has_role('admin', 'staff')));

-- match children inherit visibility from the parent match (its own RLS applies in the subquery)
do $$
declare t text;
begin
  foreach t in array array['match_players', 'goals', 'mvp_awards']
  loop
    execute format('create policy %I on public.%I for select to authenticated
      using (exists (select 1 from public.matches m where m.id = match_id))', t || '_select', t);
    execute format('create policy %I on public.%I for all to authenticated
      using ((select public.has_role(''admin'', ''staff''))) with check ((select public.has_role(''admin'', ''staff'')))',
      t || '_staff_write', t);
  end loop;
end $$;

-- ratings: players read published; viewers none; staff everything
create policy ratings_select on public.ratings for select to authenticated
  using ((select public.has_role('admin', 'staff'))
         or (published and (select public.has_role('player'))));
create policy ratings_staff_write on public.ratings for all to authenticated
  using ((select public.has_role('admin', 'staff'))) with check ((select public.has_role('admin', 'staff')));

-- availability: team reads; a player writes only their own row, only before kickoff
create policy availability_select on public.availability for select to authenticated
  using ((select public.has_role('admin', 'staff', 'player')));
create policy availability_staff_write on public.availability for all to authenticated
  using ((select public.has_role('admin', 'staff'))) with check ((select public.has_role('admin', 'staff')));
create policy availability_own_write on public.availability for all to authenticated
  using ((select public.has_role('player'))
    and player_id in (select id from public.players where profile_id = (select auth.uid())))
  with check ((select public.has_role('player'))
    and player_id in (select id from public.players where profile_id = (select auth.uid()))
    and exists (select 1 from public.matches m
                where m.id = match_id and m.status = 'scheduled' and m.kickoff_at > now()));

-- announcements: players read published, staff everything
create policy announcements_select on public.announcements for select to authenticated
  using ((select public.has_role('admin', 'staff'))
         or ((select public.has_role('player')) and published_at is not null and published_at <= now()));
create policy announcements_staff_write on public.announcements for all to authenticated
  using ((select public.has_role('admin', 'staff'))) with check ((select public.has_role('admin', 'staff')));

-- media: by min_role
create policy media_select on public.media for select to authenticated
  using ((select public.has_role('admin', 'staff'))
         or (min_role = 'viewer' and (select public.has_role('player', 'viewer')))
         or (min_role = 'player' and (select public.has_role('player'))));
create policy media_staff_write on public.media for all to authenticated
  using ((select public.has_role('admin', 'staff'))) with check ((select public.has_role('admin', 'staff')));

-- mascot: everyone reads, admin writes
create policy mascot_select on public.mascot for select to authenticated
  using ((select public.has_role('admin', 'staff', 'player', 'viewer')));
create policy mascot_admin_write on public.mascot for all to authenticated
  using ((select public.has_role('admin'))) with check ((select public.has_role('admin')));

-- ---------------------------------------------------------------- storage (all buckets private)

insert into storage.buckets (id, name, public) values
  ('player-avatars', 'player-avatars', false),
  ('player-photos', 'player-photos', false),
  ('match-media', 'match-media', false),
  ('ratings', 'ratings', false),
  ('graphics', 'graphics', false),
  ('internal-documents', 'internal-documents', false),
  ('mascot', 'mascot', false)
on conflict (id) do nothing;

create policy club_read_open on storage.objects for select to authenticated
  using (bucket_id in ('player-avatars', 'player-photos', 'graphics', 'mascot')
         and (select public.has_role('admin', 'staff', 'player', 'viewer')));
create policy club_read_team on storage.objects for select to authenticated
  using (bucket_id in ('ratings', 'internal-documents')
         and (select public.has_role('admin', 'staff', 'player')));
-- match media follows the media table row (its RLS decides)
create policy club_read_match_media on storage.objects for select to authenticated
  using (bucket_id = 'match-media'
         and exists (select 1 from public.media m where m.bucket = bucket_id and m.path = name));
create policy club_write_staff on storage.objects for all to authenticated
  using (bucket_id in ('player-avatars', 'player-photos', 'match-media', 'ratings', 'graphics', 'mascot')
         and (select public.has_role('admin', 'staff')))
  with check (bucket_id in ('player-avatars', 'player-photos', 'match-media', 'ratings', 'graphics', 'mascot')
         and (select public.has_role('admin', 'staff')));
create policy club_write_admin_docs on storage.objects for all to authenticated
  using (bucket_id = 'internal-documents' and (select public.has_role('admin')))
  with check (bucket_id = 'internal-documents' and (select public.has_role('admin')));
