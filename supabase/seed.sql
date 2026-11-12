-- DEVELOPMENT SEED ONLY. Never applied to production (`db push` does not run seeds).
-- Sample data: opponents, scores, ratings and announcements are fake. Players use only names,
-- numbers and positions that are known; unknown values stay null.
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
  ('c0000000-0000-4000-8000-000000000002', null, 'antonio-verrone', 'Antonio', 'Verrone', 8, 'midfielder', false),
  ('c0000000-0000-4000-8000-000000000003', null, 'raffaele-miranda', 'Raffaele', 'Miranda', null, null, false),
  ('c0000000-0000-4000-8000-000000000004', null, 'alfonso-avino', 'Alfonso', 'Avino', 33, 'winger', false),
  ('c0000000-0000-4000-8000-000000000005', null, 'salvatore-marigliano', 'Salvatore', 'Marigliano', 9, 'pivot', false),
  ('c0000000-0000-4000-8000-000000000006', null, 'sergio-batti', 'Sergio', 'Batti', null, null, false),
  ('c0000000-0000-4000-8000-000000000007', null, 'francesco-ferrara', 'Francesco', 'Ferrara', null, null, false);

create function pg_temp.pid(s text) returns uuid language sql as
  $$ select id from public.players where slug = s $$;

-- matches (relative to now so the preview always has a next match)
insert into public.matches (id, season_id, competition_id, opponent_id, is_home, kickoff_at, venue, status, rv_score, opp_score, notes) values
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', true,  now() - interval '28 days', 'Palazzetto Venezia', 'completed', 10, 5, 'Partita a senso unico. Il pivot in serata di grazia.'),
  ('d0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', false, now() - interval '14 days', 'Campo del Lido', 'completed', 3, 4, 'Sconfitta di misura, poteva andare diversamente.'),
  ('d0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000003', true,  now() - interval '7 days',  'Palazzetto Venezia', 'completed', 4, 4, null),
  ('d0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', true,  date_trunc('hour', now()) + interval '4 days 20 hours' - interval '0 hours', 'Palazzetto Venezia', 'scheduled', null, null, null),
  ('d0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000005', false, date_trunc('hour', now()) + interval '11 days 20 hours', 'Campo di Burano', 'scheduled', null, null, null);

-- lineups: five starters + two on the bench
insert into public.match_players (match_id, player_id, is_starter, minutes)
select m.id, p.id, p.slug in ('daniele-nappo', 'antonio-verrone', 'alfonso-avino', 'salvatore-marigliano', 'sergio-batti'), null
from public.matches m cross join public.players p
where m.status = 'completed';

-- goals: (match, scorer, assist, minute)
insert into public.goals (match_id, scorer_id, assist_id, minute)
select m, pg_temp.pid(s), pg_temp.pid(a), min from (values
  ('d0000000-0000-4000-8000-000000000001'::uuid, 'salvatore-marigliano', 'antonio-verrone', 3),
  ('d0000000-0000-4000-8000-000000000001', 'salvatore-marigliano', 'alfonso-avino', 7),
  ('d0000000-0000-4000-8000-000000000001', 'alfonso-avino', 'antonio-verrone', 11),
  ('d0000000-0000-4000-8000-000000000001', 'salvatore-marigliano', null, 15),
  ('d0000000-0000-4000-8000-000000000001', 'alfonso-avino', null, 19),
  ('d0000000-0000-4000-8000-000000000001', 'antonio-verrone', 'salvatore-marigliano', 24),
  ('d0000000-0000-4000-8000-000000000001', 'alfonso-avino', 'antonio-verrone', 28),
  ('d0000000-0000-4000-8000-000000000001', 'salvatore-marigliano', 'alfonso-avino', 33),
  ('d0000000-0000-4000-8000-000000000001', 'francesco-ferrara', null, 37),
  ('d0000000-0000-4000-8000-000000000001', 'antonio-verrone', null, 39),
  ('d0000000-0000-4000-8000-000000000002', 'alfonso-avino', 'antonio-verrone', 9),
  ('d0000000-0000-4000-8000-000000000002', 'salvatore-marigliano', 'alfonso-avino', 21),
  ('d0000000-0000-4000-8000-000000000002', 'alfonso-avino', null, 35),
  ('d0000000-0000-4000-8000-000000000003', 'antonio-verrone', 'alfonso-avino', 5),
  ('d0000000-0000-4000-8000-000000000003', 'raffaele-miranda', 'antonio-verrone', 14),
  ('d0000000-0000-4000-8000-000000000003', 'salvatore-marigliano', null, 26),
  ('d0000000-0000-4000-8000-000000000003', 'salvatore-marigliano', 'sergio-batti', 38)
) as g(m, s, a, min);

insert into public.mvp_awards (match_id, player_id) values
  ('d0000000-0000-4000-8000-000000000001', pg_temp.pid('salvatore-marigliano')),
  ('d0000000-0000-4000-8000-000000000002', pg_temp.pid('daniele-nappo')),
  ('d0000000-0000-4000-8000-000000000003', pg_temp.pid('antonio-verrone'));

insert into public.ratings (match_id, player_id, author_id, score, review, attributes, published) values
  ('d0000000-0000-4000-8000-000000000001', pg_temp.pid('sergio-batti'), 'a0000000-0000-4000-8000-000000000002', 7.5, 'Solido in difesa e affidabile in copertura. Non sbaglia un posizionamento.', '{DIFESA,POSIZIONAMENTO,CARATTERE}', true),
  ('d0000000-0000-4000-8000-000000000001', pg_temp.pid('salvatore-marigliano'), 'a0000000-0000-4000-8000-000000000002', 9.0, 'Quattro gol e una prestazione da copertina. Il pivot che tutti vorrebbero.', '{FINALIZZAZIONE,FISICO,FAME}', true),
  ('d0000000-0000-4000-8000-000000000001', pg_temp.pid('alfonso-avino'), 'a0000000-0000-4000-8000-000000000002', 8.5, 'Tripletta e due assist: sulla fascia è ingiocabile.', '{VELOCITA,DRIBBLING,VISIONE}', true),
  ('d0000000-0000-4000-8000-000000000001', pg_temp.pid('daniele-nappo'), 'a0000000-0000-4000-8000-000000000002', 6.5, 'Cinque gol subiti, ma il capitano ci mette sempre la faccia.', '{LEADERSHIP,CARATTERE}', true),
  ('d0000000-0000-4000-8000-000000000002', pg_temp.pid('daniele-nappo'), 'a0000000-0000-4000-8000-000000000002', 8.0, 'Una serata di parate impossibili. Senza di lui sarebbe stata una goleada.', '{RIFLESSI,LEADERSHIP}', true),
  ('d0000000-0000-4000-8000-000000000003', pg_temp.pid('antonio-verrone'), 'a0000000-0000-4000-8000-000000000002', 8.0, 'Il metronomo del centrocampo, gol e tanta qualità.', '{VISIONE,TECNICA}', false);

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
  ('marigliano-show-monza-travolto', 'IL PIVOT DELLA SERATA', 'Marigliano show: Monza travolto 10-5',
   'Quattro gol, una montagna di sponde e il palazzetto in piedi. Il Rall Venezia non lascia scampo agli ospiti.',
   E'Serata da incorniciare al Palazzetto Venezia. Il Rall parte forte, trova il vantaggio dopo tre minuti e non si ferma più: alla fine sono dieci i gol, cinque quelli subiti.\n\nProtagonista assoluto Salvatore Marigliano, quattro reti e il titolo di MVP. Alle sue spalle Alfonso Avino, tripletta e due assist, e un Antonio Verrone in versione regista.\n\nIl capitano Daniele Nappo incassa cinque gol ma tiene in piedi la difesa nei momenti caldi. Tre punti portati a casa e morale alle stelle.',
   'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', true, now() - interval '27 days'),
  ('lido-sconfitta-di-misura', 'TRASFERTA AMARA', 'Al Lido finisce 4-3: poteva andare diversamente',
   'Tre gol non bastano. Decide un episodio nel finale, rimpianti e una parata da copertina.',
   E'Una partita che il Rall poteva portare a casa. Avanti e indietro per tutta la sera, poi il guizzo dei padroni di casa nel finale.\n\nNappo, MVP nonostante la sconfitta, firma una serata di interventi miracolosi. Avino ancora a segno, Marigliano a referto.\n\nSi riparte dalla prossima: la classifica non si ferma, il morale nemmeno.',
   'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', false, now() - interval '13 days'),
  ('murano-pareggio-pazzo', 'SPETTACOLO AL PALAZZETTO', 'Murano, pareggio pazzo: finisce 4-4',
   'Otto gol e nessun vincitore. Verrone sceglie la serata giusta per prendersi la scena.',
   E'Otto gol, ribaltamenti e un finale al cardiopalma: Rall Venezia e Murano United si dividono la posta.\n\nIl migliore è Antonio Verrone, MVP con gol e assist. Marigliano chiude con una doppietta, Miranda trova la rete del momentaneo pareggio.\n\nUn punto che sa di occasione persa, ma lo spettacolo non è mancato.',
   'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000003', false, now() - interval '6 days'),
  ('ritrovo-prima-di-mestre', 'DALLO SPOGLIATOIO', 'Verso il Real Mestre: ritrovo alle 19:30',
   'Riscaldamento, maglie nere e nessuna scusa. La prossima è in casa.',
   E'Si torna in campo contro il Real Mestre. Appuntamento al palazzetto alle 19:30 per il riscaldamento.\n\nMister e capitano chiedono concentrazione: contro una squadra che gioca a ritmi alti servirà una partenza decisa.',
   'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000004', false, now() - interval '1 day');
