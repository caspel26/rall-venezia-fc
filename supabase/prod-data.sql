-- PRODUCTION DATA LOAD (run once, after the migrations): the real club data, no dev accounts and no sample announcements.
-- Generated from supabase/seed.sql; see docs/DEPLOYMENT.md. Accounts come from scripts/create-members.mjs afterwards.
insert into public.seasons (id, name, starts_on, is_current)
values ('b0000000-0000-4000-8000-000000000001', '2026/27', '2026-09-01', true);
insert into public.competitions (id, name, short_name)
values ('b1000000-0000-4000-8000-000000000001', 'Campionato Amatori', 'Campionato');

insert into public.players (id, profile_id, slug, first_name, last_name, shirt_number, position, is_captain) values
  ('c0000000-0000-4000-8000-000000000001', null, 'daniele-nappo', 'Daniele', 'Nappo', 1, 'goalkeeper', true),
  ('c0000000-0000-4000-8000-000000000002', null, 'antonio-verrone', 'Antonio', 'Verrone', 8, 'winger', false),
  ('c0000000-0000-4000-8000-000000000003', null, 'raffaele-miranda', 'Raffaele', 'Miranda', 10, 'jolly', false),
  ('c0000000-0000-4000-8000-000000000004', null, 'alfonso-avino', 'Alfonso', 'Avino', 33, 'winger', false),
  ('c0000000-0000-4000-8000-000000000005', null, 'salvatore-marigliano', 'Salvatore', 'Marigliano', 9, 'pivot', false),
  ('c0000000-0000-4000-8000-000000000006', null, 'sergio-batti', 'Sergio', 'Batti', 4, 'defender', false),
  ('c0000000-0000-4000-8000-000000000007', null, 'francesco-ferrara', 'Francesco', 'Ferrara', 7, 'winger', false),
  -- new in the squad (no position given, no matches played yet)
  ('c0000000-0000-4000-8000-000000000008', null, 'francesco-sepe', 'Francesco', 'Sepe', 17, null, false);

create function pg_temp.pid(s text) returns uuid language sql as
  $$ select id from public.players where slug = s $$;

-- The eight matchdays already played, as reported on the club's Instagram (scores, dates, MVPs). Times and venues
-- the posts do not state stay null.
insert into public.opponents (id, name, short_name) values
  ('b2000000-0000-4000-8000-000000000001', 'Cagliari', 'CAG'),
  ('b2000000-0000-4000-8000-000000000002', 'Roma', 'ROM'),
  ('b2000000-0000-4000-8000-000000000003', 'Lazio', 'LAZ'),
  ('b2000000-0000-4000-8000-000000000006', 'Frosinone', 'FRO'),
  ('b2000000-0000-4000-8000-000000000007', 'Napoli', 'NAP'),
  ('b2000000-0000-4000-8000-000000000008', 'Torino', 'TOR'),
  ('b2000000-0000-4000-8000-000000000009', 'Genoa', 'GEN'),
  ('b2000000-0000-4000-8000-00000000000a', 'Monza', 'MON');

create temp table seed_matches (n int, id uuid, opp uuid, home boolean, rv int, opp_sc int, kickoff timestamptz, venue text);
insert into seed_matches values
  (1, 'd0000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', true,   7, 1, '2026-09-22 22:30 Europe/Rome', 'Parco dei Principi'),
  (2, 'd0000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', false,  9, 6, '2026-09-28 22:30 Europe/Rome', 'Parco dei Principi'),
  (3, 'd0000000-0000-4000-8000-000000000006', 'b2000000-0000-4000-8000-000000000003', false,  3, 5, '2026-10-07 21:30 Europe/Rome', null),
  (4, 'd0000000-0000-4000-8000-000000000007', 'b2000000-0000-4000-8000-000000000006', true,  11, 2, '2026-10-16 20:30 Europe/Rome', 'Parco dei Principi Fornillo'),
  -- Napoli: the post is dated 21 October and gives no kick-off time; 21:30 is a stand-in until confirmed
  (5, 'd0000000-0000-4000-8000-000000000008', 'b2000000-0000-4000-8000-000000000007', false,  9, 2, '2026-10-21 21:30 Europe/Rome', null),
  (6, 'd0000000-0000-4000-8000-000000000009', 'b2000000-0000-4000-8000-000000000008', true,  10, 2, '2026-10-27 21:30 Europe/Rome', null),
  (7, 'd0000000-0000-4000-8000-00000000000a', 'b2000000-0000-4000-8000-000000000009', true,   5, 2, '2026-11-02 21:30 Europe/Rome', null),
  (8, 'd0000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-00000000000a', true,  10, 5, '2026-11-11 20:30 Europe/Rome', null);

insert into public.matches (id, season_id, competition_id, opponent_id, is_home, kickoff_at, venue, status, rv_score, opp_score, notes)
select id, 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', opp, home, kickoff, venue, 'completed', rv, opp_sc,
       case when n = 8 then 'Per il Monza a segno Califano (3), Aquino e Allegrezza.' end
from seed_matches;

-- No upcoming match: the next fixture is still to be designated (the e2e suite adds its own, see tests/e2e/fixtures.sql).

-- Lineups: everyone played every match except the absences below. Frosinone (4) is reported: Nappo and Miranda
-- were out. Miranda's second missed match is NOT reported; the owner asked for "two fewer appearances", so
-- Torino (6) stands in until it is corrected.
create temp table seed_absent (n int, slug text);
insert into seed_absent values (4, 'daniele-nappo'), (4, 'raffaele-miranda'), (6, 'raffaele-miranda');

insert into public.match_players (match_id, player_id, is_starter, minutes)
select m.id, p.id, p.slug in ('daniele-nappo', 'antonio-verrone', 'alfonso-avino', 'salvatore-marigliano', 'sergio-batti'), null
from seed_matches sm
join public.matches m on m.id = sm.id
cross join public.players p
where p.slug <> 'francesco-sepe'
  and not exists (select 1 from seed_absent a where a.n = sm.n and a.slug = p.slug);

-- Goals: only the Monza match (8) has a reported scorer list, from the club's result graphic. Events of the earlier
-- matches (scorers, assists, minutes) are NOT available and stay empty: we start recording from the next ones.
-- Monza scorers: Nappo 2, Batti, Ferrara, Marigliano, Verrone 4 and one opponent own goal (10).
insert into public.goals (match_id, scorer_id, assist_id, minute, is_own_goal)
select 'd0000000-0000-4000-8000-000000000003', pg_temp.pid(v.slug), null, null, v.slug is null
from (values ('daniele-nappo'), ('daniele-nappo'), ('sergio-batti'), ('francesco-ferrara'), ('salvatore-marigliano'),
  ('antonio-verrone'), ('antonio-verrone'), ('antonio-verrone'), ('antonio-verrone'), (null)) as v(slug);

-- Season totals as supplied by the owner (Verrone 31, Nappo 18, everyone else 3 goals; "tanti" assists, read as 8 each),
-- minus what the recorded Monza goals already give. Kept as a baseline: stats stay derived, nothing per match is invented.
insert into public.player_stat_baselines (player_id, season_id, goals, assists)
select pg_temp.pid(v.slug), 'b0000000-0000-4000-8000-000000000001', v.goals, 8
from (values ('antonio-verrone', 27), ('daniele-nappo', 16), ('sergio-batti', 2), ('francesco-ferrara', 2),
             ('salvatore-marigliano', 2), ('alfonso-avino', 3), ('raffaele-miranda', 3)) as v(slug, goals);


-- MVPs as announced on Instagram (Frosinone had two)
insert into public.mvp_awards (match_id, player_id)
select m.id, pg_temp.pid(v.slug)
from (values
  (1, 'antonio-verrone'), (2, 'daniele-nappo'), (3, 'antonio-verrone'), (4, 'alfonso-avino'), (4, 'francesco-ferrara'),
  (5, 'antonio-verrone'), (6, 'francesco-ferrara'), (7, 'sergio-batti'), (8, 'daniele-nappo')) as v(n, slug)
join seed_matches m on m.n = v.n;


-- Gazzetta: match reports written from the club's Instagram posts (facts only)
insert into public.news_articles (slug, kicker, title, summary, body, author_id, match_id, is_lead, published_at) values
  ('cagliari-7-1-buona-la-prima', 'BUONA LA PRIMA', 'Rall Venezia 7-1 Cagliari: Verrone firma quattro gol', 'Il campionato si apre con tre punti e un MVP da copertina.',
   E'La Rall Venezia FC apre il campionato con un 7-1 al Cagliari e porta a casa i primi tre punti della stagione.\n\nA prendersi la scena è Antonio Verrone: quattro gol e il premio di MVP della partita.\n\nIl 7-1 fa piacere, ma non deve cambiare nulla: è una vittoria, sono tre punti e il percorso è appena iniziato.', null, 'd0000000-0000-4000-8000-000000000001', false, '2026-09-22 23:59 Europe/Rome'),
  ('roma-6-9-rall-venezia', 'MAN OF THE MATCH', 'Roma 6-9 Rall Venezia: vittoria sofferta, Nappo uomo partita', 'Una gara intensa e nervosa, decisa nel finale. Il capitano guida i suoi.',
   E'Due partite, due vittorie. A Roma finisce 6-9 al termine di una gara intensa, giocata con tanta tensione.\n\nDaniele Nappo, con la fascia al braccio, è l''uomo della partita: personalità e presenza nei momenti che contano.\n\nTesta bassa, niente voli: il campionato è appena iniziato.', null, 'd0000000-0000-4000-8000-000000000002', false, '2026-09-28 23:59 Europe/Rome'),
  ('lazio-5-3-prima-sconfitta', 'FULL TIME', 'Lazio 5-3 Rall Venezia: arriva la prima sconfitta', 'Verrone firma tutti e tre i gol. Nota di merito per Miranda, menzione per Nappo.',
   E'Arriva la prima sconfitta stagionale: Lazio 5, Rall Venezia 3.\n\nNon basta un Antonio Verrone trascinatore, MVP della serata: al rientro dall''infortunio firma tutti e tre i gol.\n\nNota di merito per Raffaele Miranda, trascinatore morale della squadra. Menzione speciale per Daniele Nappo, che dopo una lussazione alla spalla nei primi minuti sceglie di restare al fianco dei compagni fino alla fine.\n\nSi perde insieme, si riparte insieme.', null, 'd0000000-0000-4000-8000-000000000003', false, '2026-10-07 23:59 Europe/Rome'),
  ('frosinone-11-2-la-risposta', 'LA RISPOSTA CHE SERVIVA', 'Rall Venezia 11-2 Frosinone: tre punti a casa dopo la Lazio', 'Senza Nappo e Miranda il Mister fa ruotare tutti. MVP Avino e Ferrara.',
   E'Dopo il 5-3 subito contro la Lazio, il Rall Venezia rialza la testa nel modo più convincente possibile: 11-2 al Frosinone.\n\nLe assenze del capitano Daniele Nappo e di Raffaele Miranda permettono al Mister di gestire le rotazioni e dare spazio a tutta la squadra.\n\nMVP: Alfonso Avino e Francesco Ferrara. Menzione d''onore per Antonio Verrone: cinque gol, otto nelle ultime due partite.', null, 'd0000000-0000-4000-8000-000000000006', false, '2026-10-16 23:59 Europe/Rome'),
  ('napoli-2-9-portata-a-casa', 'PORTATA A CASA, ANCORA', 'Napoli 2-9 Rall Venezia: Verrone MVP, ma vince tutta la squadra', 'Campo bagnato, pallone veloce e cinquanta minuti di sacrificio.',
   E'Partita tutt''altro che semplice per le condizioni del campo: terreno bagnato, pallone veloce e tanti episodi difficili da gestire.\n\nMa il Rall Venezia non si scompone. Napoli 2, Rall Venezia 9.\n\nMVP Antonio Verrone, ma oggi il premio è quasi riduttivo: dal primo all''ultimo minuto ognuno ha dato qualcosa.', null, 'd0000000-0000-4000-8000-000000000007', false, '2026-10-21 23:59 Europe/Rome'),
  ('torino-10-2-serata-perfetta', 'SERATA PRATICAMENTE PERFETTA', 'Rall Venezia 10-2 Torino: Ferrara MVP', 'Dieci gol, ancora cinque per Verrone. In panchina manca il Mister Gallo.',
   E'Il Rall Venezia domina, segna tanto e porta a casa un''altra vittoria pesantissima: 10-2 al Torino.\n\nMVP Francesco Ferrara: prestazione enorme, tanta qualità e presenza continua nella manovra.\n\nMenzione d''onore per Antonio Verrone, che continua il suo momento clamoroso e mette a referto altri cinque gol. Da sottolineare l''assenza del Mister Gallo: la squadra si gestisce in autonomia per tutta la gara.', null, 'd0000000-0000-4000-8000-000000000008', false, '2026-10-27 23:59 Europe/Rome'),
  ('genoa-5-2-batti-mvp', 'MVP SERGIO BATTI', 'Rall Venezia 5-2 Genoa: Batti decisivo', 'Battaglia navale vinta. La redazione corregge il tiro sull''MVP.',
   E'Rall Venezia FC batte il Genoa 5-2.\n\nMVP della partita è Sergio Batti: prestazione solida, presente quando serviva e decisivo nel contribuire alla vittoria.', null, 'd0000000-0000-4000-8000-000000000009', false, '2026-11-02 23:59 Europe/Rome'),
  ('monza-10-5-quest-completata', 'QUEST COMPLETATA', 'Rall Venezia 10-5 Monza: Nappo uomo partita', 'Missione riuscita: altri tre punti nel bottino.',
   E'La missione era chiara: entrare, lottare e portare a casa i tre punti. Missione riuscita: Rall Venezia 10, Monza 5.\n\nPartita intensa, tanti gol e un''altra vittoria da mettere in archivio.\n\nMVP Daniele Nappo: il capitano risponde presente ancora una volta, con sicurezza tra i pali e quella personalità che nei momenti importanti si sente sempre.', null, 'd0000000-0000-4000-8000-00000000000a', true, '2026-11-12 09:00 Europe/Rome');

-- staff, as given in the reference pack (v3)
insert into public.staff_members (slug, first_name, last_name, role_title, sort_order) values
  ('pasquale-gallo', 'Pasquale', 'Gallo', 'Allenatore / Mister', 1),
  ('benito-marciano', 'Benito', 'Marciano', 'Secondo allenatore', 2),
  ('giuseppe-casillo', 'Giuseppe', 'Casillo', 'Social media manager · Grafico · Videomaker', 3);

-- next week's poll (Mon-Fri), already open, with a few votes so the preview has something to show
insert into public.polls (id, week_start, closes_at)
values ('e0000000-0000-4000-8000-000000000001',
        (date_trunc('week', now() + interval '7 days'))::date,
        ((date_trunc('week', now() + interval '7 days'))::date + interval '4 days 20 hours') at time zone 'Europe/Rome');
insert into public.poll_votes (poll_id, player_id, day)
select 'e0000000-0000-4000-8000-000000000001', pg_temp.pid(v.slug), (date_trunc('week', now() + interval '7 days'))::date + v.d
from (values
  -- the weekly poll as it stands in the group (Mon=0 .. Fri=4); "Totor" is Marigliano, "Cry More" is Batti
  ('francesco-ferrara', 0), ('francesco-ferrara', 1), ('francesco-ferrara', 2), ('francesco-ferrara', 3),
  ('alfonso-avino', 0), ('alfonso-avino', 1), ('alfonso-avino', 2), ('alfonso-avino', 3), ('alfonso-avino', 4),
  ('daniele-nappo', 1), ('daniele-nappo', 2), ('daniele-nappo', 3),
  ('salvatore-marigliano', 0), ('salvatore-marigliano', 1), ('salvatore-marigliano', 4),
  ('sergio-batti', 0), ('sergio-batti', 1), ('sergio-batti', 2), ('sergio-batti', 3), ('sergio-batti', 4)
) as v(slug, d);

-- league table as supplied by the owner (the league's teams carry Serie A names; Rall Venezia is "Venezia")
insert into public.standings (season_id, team, points, sort_order, is_us) values
  ('b0000000-0000-4000-8000-000000000001', 'Lazio', 21, 1, false),
  ('b0000000-0000-4000-8000-000000000001', 'Como', 19, 2, false),
  ('b0000000-0000-4000-8000-000000000001', 'Venezia', 18, 3, true),
  ('b0000000-0000-4000-8000-000000000001', 'Napoli', 18, 4, false),
  ('b0000000-0000-4000-8000-000000000001', 'Parma', 16, 5, false),
  ('b0000000-0000-4000-8000-000000000001', 'Milan', 15, 6, false),
  ('b0000000-0000-4000-8000-000000000001', 'Atalanta', 13, 7, false),
  ('b0000000-0000-4000-8000-000000000001', 'Sassuolo', 12, 8, false),
  ('b0000000-0000-4000-8000-000000000001', 'Monza', 12, 9, false),
  ('b0000000-0000-4000-8000-000000000001', 'Cagliari', 12, 10, false),
  ('b0000000-0000-4000-8000-000000000001', 'Inter', 10, 11, false),
  ('b0000000-0000-4000-8000-000000000001', 'Genoa', 9, 12, false),
  ('b0000000-0000-4000-8000-000000000001', 'Roma', 9, 13, false),
  ('b0000000-0000-4000-8000-000000000001', 'Udinese', 9, 14, false),
  ('b0000000-0000-4000-8000-000000000001', 'Bologna', 6, 15, false),
  ('b0000000-0000-4000-8000-000000000001', 'Juventus', 6, 16, false),
  ('b0000000-0000-4000-8000-000000000001', 'Lecce', 3, 17, false),
  ('b0000000-0000-4000-8000-000000000001', 'Fiorentina', 0, 18, false),
  ('b0000000-0000-4000-8000-000000000001', 'Frosinone', 0, 19, false),
  ('b0000000-0000-4000-8000-000000000001', 'Torino', 0, 20, false);
