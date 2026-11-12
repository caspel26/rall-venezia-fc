-- Fixes from the independent security review.

-- 1. external_url is rendered as a link: only Instagram https URLs are allowed (no javascript: links).
alter table public.news_articles
  add constraint news_external_url_instagram
  check (external_url is null or external_url ~ '^https://(www\.)?instagram\.com/');

-- 2. Linking a player to an account is admin-only on INSERT as well as UPDATE.
create or replace function public.guard_player_link() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select auth.uid()) is not null and not public.has_role('admin') then
    if tg_op = 'INSERT' and new.profile_id is not null then
      raise exception 'admin_only_link' using errcode = '42501';
    elsif tg_op = 'UPDATE' and new.profile_id is distinct from old.profile_id then
      raise exception 'admin_only_link' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
drop trigger guard_player_link on public.players;
create trigger guard_player_link before insert or update on public.players
  for each row execute function public.guard_player_link();

-- 3. A player can only touch their own answer while the match is still ahead (using as well as with check),
--    so they cannot delete or re-point a past answer.
drop policy availability_own_write on public.availability;
create policy availability_own_write on public.availability for all to authenticated
  using ((select public.has_role('player'))
    and player_id in (select id from public.players where profile_id = (select auth.uid()))
    and exists (select 1 from public.matches m where m.id = match_id and m.status = 'scheduled' and m.kickoff_at > now()))
  with check ((select public.has_role('player'))
    and player_id in (select id from public.players where profile_id = (select auth.uid()))
    and exists (select 1 from public.matches m where m.id = match_id and m.status = 'scheduled' and m.kickoff_at > now()));
