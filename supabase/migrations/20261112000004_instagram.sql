-- Instagram -> Gazzetta sync. The access token lives only in instagram_connection, which has RLS on
-- and NO policies: only the service role (server routes) can read or write it.

alter table public.news_articles
  add column source text not null default 'manual' check (source in ('manual', 'instagram')),
  add column external_id text unique,
  add column external_url text;

create table public.instagram_connection (
  id boolean primary key default true check (id),   -- single row
  access_token text not null,
  username text,
  token_refreshed_at timestamptz not null default now(),
  expires_at timestamptz,
  last_synced_at timestamptz,
  last_error text,
  updated_at timestamptz not null default now()
);
alter table public.instagram_connection enable row level security;
revoke all on public.instagram_connection from anon, authenticated;
