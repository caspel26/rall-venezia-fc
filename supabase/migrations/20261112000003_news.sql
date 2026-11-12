-- Gazzetta: newspaper-style club news. Plain-text bodies (paragraphs split on blank lines), no HTML.

create table public.news_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kicker text,                       -- "occhiello": the small line above the headline
  title text not null,
  summary text,                      -- "sommario": the line under the headline
  body text not null,
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  author_name text,                  -- copied from the profile on insert: players cannot read other profiles
  match_id uuid references public.matches (id) on delete set null,
  cover_path text,
  is_lead boolean not null default false,   -- front-page lead story
  published_at timestamptz,                 -- null = draft
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index news_published on public.news_articles (published_at desc);
create index news_match on public.news_articles (match_id);
create unique index news_one_lead on public.news_articles (is_lead) where is_lead;

create function public.news_fill_author() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.author_name is null and new.author_id is not null then
    select coalesce(display_name, email) into new.author_name from public.profiles where id = new.author_id;
  end if;
  return new;
end $$;
create trigger news_fill_author before insert on public.news_articles
  for each row execute function public.news_fill_author();

create trigger set_updated_at before update on public.news_articles
  for each row execute function public.set_updated_at();

alter table public.news_articles enable row level security;
revoke all on public.news_articles from anon;

-- Published articles are readable by every signed-in role; drafts only by staff.
create policy news_select on public.news_articles for select to authenticated
  using ((select public.has_role('admin', 'staff'))
         or ((select public.has_role('player', 'viewer')) and published_at is not null and published_at <= now()));
create policy news_staff_write on public.news_articles for all to authenticated
  using ((select public.has_role('admin', 'staff'))) with check ((select public.has_role('admin', 'staff')));
