-- DEVELOPMENT SEED ONLY. Never applied to production (`db push` does not run seeds).
-- Sample data: opponents, scores, ratings and announcements are fake. Players use only the names,
-- numbers and positions the owner supplied in the player reference pack; anything else stays null.
-- Dev logins (password `rall-dev-password`): admin@ / staff@ / player@ / viewer@ example.invalid

-- dev auth users with fixed ids (used by pgTAP tests)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current,
  reauthentication_token, phone_change, phone_change_token)
select '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  crypt('rall-dev-password', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', u.name), now(), now(),
  '', '', '', '', '', '', '', ''
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'admin@example.invalid', 'Admin Dev'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'staff@example.invalid', 'Staff Dev'),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'player@example.invalid', 'Daniele Nappo'),
  ('a0000000-0000-4000-8000-000000000004'::uuid, 'viewer@example.invalid', 'Viewer Dev')
) as u(id, email, name);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text, 'email',
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true), now(), now(), now()
from auth.users where email like '%@example.invalid';

-- trigger created everyone as viewer; raise the dev roles
update public.user_roles set role = 'admin' where user_id = 'a0000000-0000-4000-8000-000000000001';
update public.user_roles set role = 'staff' where user_id = 'a0000000-0000-4000-8000-000000000002';
update public.user_roles set role = 'player' where user_id = 'a0000000-0000-4000-8000-000000000003';

insert into public.seasons (id, name, starts_on, is_current)
values ('b0000000-0000-4000-8000-000000000001', '2026/27', '2026-09-01', true);
insert into public.competitions (id, name, short_name)
values ('b1000000-0000-4000-8000-000000000001', 'Campionato Amatori', 'Campionato');

insert into public.opponents (id, name, short_name) values
  ('b2000000-0000-4000-8000-000000000001', 'Monza', 'MON'),
  ('b2000000-0000-4000-8000-000000000002', 'Lido FC', 'LID'),
  ('b2000000-0000-4000-8000-000000000003', 'Murano United', 'MUR'),
  ('b2000000-0000-4000-8000-000000000004', 'Real Mestre', 'MES'),
  ('b2000000-0000-4000-8000-000000000005', 'Burano Boys', 'BUR');

insert into public.players (id, profile_id, slug, first_name, last_name, shirt_number, position, is_captain) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'daniele-nappo', 'Daniele', 'Nappo', 1, 'goalkeeper', true),
  ('c0000000-0000-4000-8000-000000000002', null, 'antonio-verrone', 'Antonio', 'Verrone', 8, 'winger', false),
  ('c0000000-0000-4000-8000-000000000003', null, 'raffaele-miranda', 'Raffaele', 'Miranda', 10, 'jolly', false),
  ('c0000000-0000-4000-8000-000000000004', null, 'alfonso-avino', 'Alfonso', 'Avino', 33, 'winger', false),
  ('c0000000-0000-4000-8000-000000000005', null, 'salvatore-marigliano', 'Salvatore', 'Marigliano', 9, 'pivot', false),
  ('c0000000-0000-4000-8000-000000000006', null, 'sergio-batti', 'Sergio', 'Batti', 4, 'defender', false),
  ('c0000000-0000-4000-8000-000000000007', null, 'francesco-ferrara', 'Francesco', 'Ferrara', 7, 'winger', false);

create function pg_temp.pid(s text) returns uuid language sql as
  $$ select id from public.players where slug = s $$;

-- Eight matchdays already played (weekly, oldest first) + two upcoming. Dates are relative to now so
-- the preview always has a next match. Ids: completed 001-003 and 006-00a, upcoming 004 and 005.
insert into public.opponents (id, name, short_name) values
  ('b2000000-0000-4000-8000-000000000006', 'Jesolo Beach', 'JES'),
  ('b2000000-0000-4000-8000-000000000007', 'Spinea Calcio', 'SPI'),
  ('b2000000-0000-4000-8000-000000000008', 'Marghera 5', 'MAR'),
  ('b2000000-0000-4000-8000-000000000009', 'Mira Futsal', 'MIR');

create temp table seed_matches (n int, id uuid, opp uuid, home boolean, rv int, opp_sc int, venue text, notes text);
insert into seed_matches values
  (1, 'd0000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', true,  10, 5, 'Palazzetto Venezia', 'Partita a senso unico: il Rall non si è mai fermato.'),
  (2, 'd0000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', false,  3, 4, 'Campo del Lido', 'Sconfitta di misura, poteva andare diversamente.'),
  (3, 'd0000000-0000-4000-8000-000000000006', 'b2000000-0000-4000-8000-000000000005', false,  9, 6, 'Campo di Burano', null),
  (4, 'd0000000-0000-4000-8000-000000000007', 'b2000000-0000-4000-8000-000000000007', true,   8, 3, 'Palazzetto Venezia', null),
  (5, 'd0000000-0000-4000-8000-000000000008', 'b2000000-0000-4000-8000-000000000006', false,  7, 8, 'Jesolo Arena', 'Otto gol subiti: serata da dimenticare.'),
  (6, 'd0000000-0000-4000-8000-000000000009', 'b2000000-0000-4000-8000-000000000008', true,  12, 5, 'Palazzetto Venezia', null),
  (7, 'd0000000-0000-4000-8000-00000000000a', 'b2000000-0000-4000-8000-000000000009', false,  9, 2, 'Palestra di Mira', null),
  (8, 'd0000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000003', true,   4, 4, 'Palazzetto Venezia', null);

insert into public.matches (id, season_id, competition_id, opponent_id, is_home, kickoff_at, venue, status, rv_score, opp_score, notes)
select id, 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', opp, home,
       date_trunc('hour', now()) - ((9 - n) * interval '7 days') + interval '19 hours' - extract(hour from date_trunc('hour', now())) * interval '1 hour',
       venue, 'completed', rv, opp_sc, notes
from seed_matches;

insert into public.matches (id, season_id, competition_id, opponent_id, is_home, kickoff_at, venue, status) values
  ('d0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', true,  date_trunc('day', now()) + interval '4 days 19 hours', 'Palazzetto Venezia', 'scheduled'),
  ('d0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000005', false, date_trunc('day', now()) + interval '11 days 19 hours', 'Campo di Burano', 'scheduled');

-- lineups: five starters + two on the bench
insert into public.match_players (match_id, player_id, is_starter, minutes)
select m.id, p.id, p.slug in ('daniele-nappo', 'antonio-verrone', 'alfonso-avino', 'salvatore-marigliano', 'sergio-batti'), null
from public.matches m cross join public.players p
where m.status = 'completed';

-- Goals. Totals after eight matchdays: Antonio Verrone 31, Daniele Nappo 16, everyone else 3 (= 62 = the sum of
-- our scores). Scorers are shuffled deterministically across the matches; every goal gets an assist where the
-- quota allows (about 8 per player: "tanti").
create temp table seed_goals as
with quotas(slug, goals) as (values
  ('antonio-verrone', 31), ('daniele-nappo', 16), ('alfonso-avino', 3), ('salvatore-marigliano', 3),
  ('sergio-batti', 3), ('raffaele-miranda', 3), ('francesco-ferrara', 3)),
pool as (
  select q.slug, g from quotas q, generate_series(1, q.goals) g
),
shuffled as (
  select slug, row_number() over (order by md5(slug || g::text)) as k from pool
),
slots as (
  select m.n, m.id as match_id,
         row_number() over (order by m.n, gs) as k,
         gs as nth, m.rv
  from seed_matches m, generate_series(1, m.rv) gs
)
select s.match_id, sh.slug as scorer, s.nth,
       (s.nth * 40 / (s.rv + 1))::int as minute, s.k
from slots s join shuffled sh using (k);

alter table seed_goals add column assist text;

do $$
declare
  r record;
  quota jsonb := '{"antonio-verrone":8,"daniele-nappo":8,"alfonso-avino":8,"salvatore-marigliano":8,"sergio-batti":8,"raffaele-miranda":8,"francesco-ferrara":8}';
  pick text;
begin
  for r in select * from seed_goals order by k loop
    select key into pick from jsonb_each_text(quota)
      where key <> r.scorer and value::int > 0
      order by value::int desc, md5(key || r.k::text) limit 1;
    if pick is not null then
      update seed_goals set assist = pick where k = r.k;
      quota := jsonb_set(quota, array[pick], to_jsonb((quota ->> pick)::int - 1));
    end if;
  end loop;
end $$;

insert into public.goals (match_id, scorer_id, assist_id, minute)
select match_id, pg_temp.pid(scorer), pg_temp.pid(assist), minute from seed_goals;

-- MVP: whoever scored most in the match (ties go to the first by name)
insert into public.mvp_awards (match_id, player_id)
select distinct on (g.match_id) g.match_id, g.scorer_id
from (select match_id, scorer_id, count(*) c from public.goals group by 1, 2) g
join public.players p on p.id = g.scorer_id
order by g.match_id, g.c desc, p.last_name;

insert into public.ratings (match_id, player_id, author_id, score, review, attributes, published) values
  ('d0000000-0000-4000-8000-000000000001', pg_temp.pid('sergio-batti'), 'a0000000-0000-4000-8000-000000000002', 7.5, 'Solido in difesa e affidabile in copertura. Non sbaglia un posizionamento.', '{DIFESA,POSIZIONAMENTO,CARATTERE}', true),
  ('d0000000-0000-4000-8000-000000000001', pg_temp.pid('salvatore-marigliano'), 'a0000000-0000-4000-8000-000000000002', 9.0, 'Una serata da pivot vero: sponde pulite e gol quando servono.', '{FINALIZZAZIONE,FISICO,FAME}', true),
  ('d0000000-0000-4000-8000-000000000001', pg_temp.pid('alfonso-avino'), 'a0000000-0000-4000-8000-000000000002', 8.5, 'Sulla fascia è ingiocabile: corsa, dribbling e assist a ripetizione.', '{VELOCITA,DRIBBLING,VISIONE}', true),
  ('d0000000-0000-4000-8000-000000000001', pg_temp.pid('daniele-nappo'), 'a0000000-0000-4000-8000-000000000002', 6.5, 'Cinque gol subiti, ma il capitano ci mette sempre la faccia.', '{LEADERSHIP,CARATTERE}', true),
  ('d0000000-0000-4000-8000-000000000002', pg_temp.pid('daniele-nappo'), 'a0000000-0000-4000-8000-000000000002', 8.0, 'Una serata di parate impossibili. Senza di lui sarebbe stata una goleada.', '{RIFLESSI,LEADERSHIP}', true),
  ('d0000000-0000-4000-8000-000000000003', pg_temp.pid('antonio-verrone'), 'a0000000-0000-4000-8000-000000000002', 8.0, 'Il metronomo del campo: gol e tanta qualità.', '{VISIONE,TECNICA}', false);

-- availability for the next match
insert into public.availability (match_id, player_id, status) values
  ('d0000000-0000-4000-8000-000000000004', pg_temp.pid('antonio-verrone'), 'available'),
  ('d0000000-0000-4000-8000-000000000004', pg_temp.pid('alfonso-avino'), 'available'),
  ('d0000000-0000-4000-8000-000000000004', pg_temp.pid('salvatore-marigliano'), 'available'),
  ('d0000000-0000-4000-8000-000000000004', pg_temp.pid('sergio-batti'), 'maybe'),
  ('d0000000-0000-4000-8000-000000000004', pg_temp.pid('raffaele-miranda'), 'unavailable');

insert into public.announcements (author_id, title, body, pinned, published_at) values
  ('a0000000-0000-4000-8000-000000000002', 'Ritrovo prima della partita', 'Ci vediamo alle 19:30 al palazzetto per il riscaldamento. Maglie nere, borsa pronta. Chi è in ritardo paga il caffè.', true, now() - interval '1 day'),
  ('a0000000-0000-4000-8000-000000000002', 'Tre punti portati a casa', 'Grande vittoria contro il Monza. Foto e pagelle già nella sezione dedicata.', false, now() - interval '27 days');

-- Gazzetta sample articles (fake sample copy about the fake sample matches)
insert into public.news_articles (slug, kicker, title, summary, body, author_id, match_id, is_lead, published_at) values
  ('monza-travolto-10-5', 'GIORNATA D''APERTURA', 'Monza travolto: al Palazzetto finisce 10-5',
   'Dieci gol, il palazzetto in piedi e tre punti portati a casa. Il Rall Venezia non lascia scampo agli ospiti.',
   E'Serata da incorniciare al Palazzetto Venezia. Il Rall parte forte, trova il vantaggio dopo pochi minuti e non si ferma più: alla fine sono dieci i gol, cinque quelli subiti.\n\nLa squadra gira a meraviglia, con la fascia in grande spolvero e il pivot che fa a sportellate con tutti.\n\nIl capitano Daniele Nappo incassa cinque gol ma tiene in piedi la difesa nei momenti caldi. Tre punti portati a casa e morale alle stelle.',
   'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', true, now() - interval '27 days'),
  ('lido-sconfitta-di-misura', 'TRASFERTA AMARA', 'Al Lido finisce 4-3: poteva andare diversamente',
   'Tre gol non bastano. Decide un episodio nel finale, rimpianti e una parata da copertina.',
   E'Una partita che il Rall poteva portare a casa. Avanti e indietro per tutta la sera, poi il guizzo dei padroni di casa nel finale.\n\nNappo firma una serata di interventi miracolosi.\n\nSi riparte dalla prossima: la classifica non si ferma, il morale nemmeno.',
   'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', false, now() - interval '13 days'),
  ('murano-pareggio-pazzo', 'SPETTACOLO AL PALAZZETTO', 'Murano, pareggio pazzo: finisce 4-4',
   'Otto gol e nessun vincitore. L''ultima giornata lascia tutto aperto.',
   E'Otto gol, ribaltamenti e un finale al cardiopalma: Rall Venezia e Murano United si dividono la posta.\n\nOtto reti in totale e un pareggio che sa di occasione persa.\n\nUn punto che sa di occasione persa, ma lo spettacolo non è mancato.',
   'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000003', false, now() - interval '6 days'),
  ('ritrovo-prima-di-mestre', 'DALLO SPOGLIATOIO', 'Verso il Real Mestre: ritrovo alle 19:30',
   'Riscaldamento, maglie nere e nessuna scusa. La prossima è in casa.',
   E'Si torna in campo contro il Real Mestre. Appuntamento al palazzetto alle 19:30 per il riscaldamento.\n\nMister e capitano chiedono concentrazione: contro una squadra che gioca a ritmi alti servirà una partenza decisa.',
   'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000004', false, now() - interval '1 day');
