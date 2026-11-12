-- "Laterale / Jolly" is a squad role of its own (Raffaele Miranda).
alter table public.players drop constraint players_position_check;
alter table public.players add constraint players_position_check
  check (position in ('goalkeeper', 'defender', 'winger', 'midfielder', 'pivot', 'jolly'));
