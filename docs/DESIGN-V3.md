# Design v3: modern clubhouse

Spec for the v3 visual pass. One recommendation per question. Implement in the build plan order (section 9).
Dark only. Mobile first (390px), checked at 1440. Supersedes the "Stage, widgets and life (v2)" section of `DESIGN_SYSTEM.md`.

---

## 1. Principles

1. **Sports app, not print.** Dark layered surfaces, large Anton headlines, Geist for everything else, soft depth (glow, blur, shadow on lift). No paper, no serif, no tape, no rotation.
2. **The player is the hero.** Cutouts are shown big and close (bust crops), on one refined backdrop: the **stage** (soft crest-colour light + a thin roundel ring + grain).
3. **One accent, used with intent.** Orange = action, current, live, focus. Deep green = atmosphere (glows, staff accent). Gold = MVP/awards only.
4. **Every interactive card responds.** Same hover language everywhere: lift, light, image push. Same touch language: press scale. Nothing static that is clickable.
5. **Icons carry meaning.** Every section header, chip and category gets a 24px stroke icon from `AppIcon`. Status is shape + icon + colour, never colour alone.

### Delete

| What | Where |
| --- | --- |
| `.stripes` utility and the striped `repeating-linear-gradient` in `.stage` | `components.css`, `app/layouts/auth.vue`, `app/error.vue` (use `.stage` instead) |
| `--paper`, `--paper-ink`, `--paper-muted`, `--paper-rule`, `--paper-accent`, `--font-serif` | `tokens.css` |
| Source Serif 4 font imports (3 lines) | `nuxt.config.ts` css array; remove `@fontsource/source-serif-4` from `package.json` |
| `NewsMasthead.vue`, `NewsStory.vue` | replaced by `NewsCard.vue`, `NewsChip.vue` |
| Taped note (`.tape`, `rotate(-.9deg)`, cream `#f3e6c6`) | `AnnouncementWidget.vue` |
| Masthead strings "Anno I", "Edizione dello spogliatoio", "Il quotidiano…", "Prima pagina", "Edizioni precedenti", drop cap, 2-column body | news pages |

---

## 2. Tokens (`app/assets/css/tokens.css`)

Replace/add exactly these. Keep everything else as is.

```css
:root {
  /* surfaces: three steps + glass */
  --rv-black: #0b0b09;
  --rv-surface: #131312;
  --rv-surface-2: #1a1a18;
  --rv-surface-3: #23231f;
  --rv-glass: rgb(19 19 18 / .72);
  --rv-line: rgb(255 255 255 / .07);
  --rv-line-strong: rgb(255 255 255 / .14);
  --rv-cream: #f3ead8;
  --rv-cream-2: rgb(243 234 216 / .86);   /* body copy on dark */
  --rv-muted: #a39c8c;

  /* accent tints */
  --rv-orange-soft: rgb(253 127 16 / .14);
  --rv-orange-line: rgb(253 127 16 / .45);
  --rv-green-glow: rgb(25 82 43 / .70);
  --rv-green-ui: #4fb874;                 /* staff accent text/lines: 7.6:1 on surface */
  --rv-gold-soft: rgb(212 175 55 / .16);

  /* shape */
  --r-s: 8px;        /* chips, inputs, buttons */
  --r-card: 16px;    /* cards */
  --r-panel: 20px;   /* widgets, heroes */
  --r-pill: 999px;

  /* depth */
  --shadow-lift: 0 24px 48px -16px rgb(0 0 0 / .7), 0 0 0 1px var(--rv-orange-line);
  --shadow-lift-green: 0 24px 48px -16px rgb(0 0 0 / .7), 0 0 0 1px rgb(79 184 116 / .45);
  --shadow-panel: 0 1px 0 rgb(255 255 255 / .04) inset, 0 12px 32px -20px rgb(0 0 0 / .8);
  --panel-bg: linear-gradient(180deg, #181816 0%, #121211 100%);

  /* motion */
  --dur-hover: 320ms;
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);   /* press release, chip select */

  /* texture: white noise baked at 12% alpha, used inside background stacks */
  --noise: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.12'/></svg>");

  /* type additions */
  --fs-lead: 20px;    /* article standfirst, first paragraph */
  --fs-article: 18px; /* article body */
  --fs-mega: clamp(72px, 11vw, 168px); /* profile surname, Gazzetta lead headline cap */
}
```

`.panel` (components.css) becomes:

```css
.panel { background: var(--panel-bg); border: 1px solid var(--rv-line); border-radius: var(--r-panel); padding: var(--space-5); box-shadow: var(--shadow-panel); }
@media (max-width: 700px) { .panel { padding: 20px; } }
```

Reduced motion block in tokens also zeroes `--dur-hover`.

---

## 3. The stage (replaces stripes)

Recipe: dark green-black base, a warm orange spotlight behind the head, deep-green glows from the lower-left and upper-right corners, grain, and a thin **double ring** (the crest roundel) behind the player. Replace `.stage` in `components.css` with:

```css
.stage {
  position: relative; isolation: isolate; overflow: hidden;
  --ring-size: 92%; --ring-top: 4%; --spot-y: 30%;
  background:
    var(--noise),
    radial-gradient(46% 38% at 50% var(--spot-y), rgb(253 127 16 / .32) 0%, rgb(253 127 16 / .10) 48%, transparent 76%),
    radial-gradient(90% 70% at 0% 100%, var(--rv-green-glow) 0%, transparent 62%),
    radial-gradient(70% 55% at 100% 0%, rgb(25 82 43 / .42) 0%, transparent 60%),
    linear-gradient(180deg, #121510 0%, #0b0b09 100%);
}
/* the roundel: two hairline rings, fading out toward the bottom */
.stage::before {
  content: ''; position: absolute; z-index: -1; pointer-events: none;
  left: 50%; top: var(--ring-top); width: var(--ring-size); aspect-ratio: 1; translate: -50% 0;
  border-radius: 50%;
  border: 1px solid rgb(253 127 16 / .30);
  box-shadow: inset 0 0 0 10px rgb(253 127 16 / .035), inset 0 0 0 11px rgb(79 184 116 / .22);
  -webkit-mask-image: linear-gradient(180deg, #000 35%, transparent 80%); mask-image: linear-gradient(180deg, #000 35%, transparent 80%);
  transition: scale var(--dur-hover) var(--ease-out), border-color var(--dur-hover) var(--ease-standard);
}
/* bottom fade into whatever is under it (unchanged contract) */
.stage::after { content: ''; position: absolute; inset: auto 0 0 0; height: 38%; z-index: 1; pointer-events: none; background: linear-gradient(180deg, transparent, var(--stage-fade, var(--rv-surface))); }

/* green variant for staff */
.stage--staff { background:
    var(--noise),
    radial-gradient(46% 38% at 50% var(--spot-y), rgb(79 184 116 / .26) 0%, rgb(79 184 116 / .08) 48%, transparent 76%),
    radial-gradient(90% 70% at 100% 100%, rgb(253 127 16 / .16) 0%, transparent 60%),
    radial-gradient(80% 60% at 0% 0%, var(--rv-green-glow) 0%, transparent 62%),
    linear-gradient(180deg, #0f1611 0%, #0b0b09 100%); }
.stage--staff::before { border-color: rgb(79 184 116 / .34); }

/* live layer for big heroes only: a slow aurora drift (transform-only) */
.stage-aurora { position: absolute; inset: -25%; z-index: -1; pointer-events: none;
  background: radial-gradient(30% 30% at 30% 40%, rgb(253 127 16 / .14), transparent 70%), radial-gradient(35% 35% at 70% 60%, rgb(25 82 43 / .5), transparent 70%);
  animation: aurora 18s var(--ease-standard) infinite alternate; }
@keyframes aurora { from { transform: translate3d(-4%, 2%, 0) scale(1); } to { transform: translate3d(5%, -3%, 0) scale(1.1); } }
@media (prefers-reduced-motion: reduce) { .stage-aurora { animation: none; } }
```

Outlined numbers (`.outline-text`): stroke `1.5px rgb(253 127 16 / .38)`; add `.outline-text--fill` = `color: rgb(253 127 16 / .06)` (a faint fill makes the number read as a shape, not a wire).

Login/error: replace `.stripes` with `class="stage"` + `<span class="stage-aurora" />`, `--ring-size: 640px; --ring-top: 10%`.

---

## 4. Shared card language

### 4.1 `v-tilt` directive (`app/plugins/tilt.client.ts`, new)
- Pointer-fine only (`matchMedia('(hover: hover) and (pointer: fine)')`) and not reduced motion; otherwise no-op.
- On `pointermove` sets `--rx` (−4deg…4deg from Y) and `--ry` (−5deg…5deg from X), `--mx`/`--my` (0–100% pointer position) on the element; rAF-throttled. `pointerleave` resets to 0 / 50%.
- CSS applies `transform: perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0)) translateY(var(--lift,0))`.

### 4.2 `.person-card` (components.css; used by PlayerCard and StaffCard)

```css
.person-card { position: relative; display: block; border-radius: var(--r-card); overflow: hidden; background: var(--rv-surface);
  box-shadow: inset 0 0 0 1px var(--rv-line); text-decoration: none; color: inherit; --accent: var(--rv-orange); --lift-shadow: var(--shadow-lift);
  transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--lift, 0px));
  transition: transform var(--dur-hover) var(--ease-out), box-shadow var(--dur-hover) var(--ease-out); }
.person-card .shine { position: absolute; inset: 0; z-index: 5; pointer-events: none; opacity: 0;
  background: radial-gradient(40% 30% at var(--mx, 50%) var(--my, 0%), rgb(255 255 255 / .12), transparent 70%);
  transition: opacity var(--dur-hover) var(--ease-standard); }
.person-card .accent-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; z-index: 5; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform 500ms var(--ease-out); }
@media (hover: hover) {
  .person-card:hover { --lift: -6px; box-shadow: var(--lift-shadow); }
  .person-card:hover .shine { opacity: 1; }
  .person-card:hover .accent-bar { transform: scaleX(1); }
  .person-card:hover .stage::before { scale: 1.06; border-color: color-mix(in srgb, var(--accent) 60%, transparent); }
  .person-card:hover .shot.in { transform: translateY(-2%) scale(1.05); }
}
.person-card:active { transform: scale(.98); transition-duration: var(--dur-fast); }
.person-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
```
Reduced motion: global rule already kills transitions; `v-tilt` is a no-op; hover keeps the shadow + bar (instant).

---

## 5. Component specs

### 5.1 PlayerCard
- **Purpose**: squad grid entry, links to profile.
- **Anatomy** (single block, info overlaid on the portrait, no separate info strip):
  1. `PlayerPortrait` (variant `portrait`, 4/5 aspect, fills card).
  2. Top-left number chip: `#7`, Anton 20px, cream, `--rv-glass` bg + `backdrop-filter: blur(8px)`, padding 4px 10px, radius `--r-pill`. Missing number: hide.
  3. Top-right captain badge: 28px gold circle "C" (unchanged) with `box-shadow: 0 0 0 3px rgb(11 11 9 / .6)`.
  4. Bottom overlay (z 3, padding 16px, over the stage fade): position eyebrow (orange, 12px, .14em), name Anton: first name 20px `--rv-cream-2`, last name 32px (phone 26px) cream, line-height .9; nickname 14px muted.
  5. `.shine`, `.accent-bar`.
- **Sizes**: grid 2 cols phone gap 12, 3 cols ≥701 gap 16, 4 cols ≥1051 gap 24. Aspect 4/5. Radius 16.
- **Portrait inside card**: `--stage-fade: var(--rv-surface)`, `--ring-size: 96%`, `--ring-top: 2%`, `--spot-y: 26%`; outlined number `font-size: 70cqw`, top 4%, right −4% (offset to the side, not centred behind the face), with `.outline-text--fill`.
- **States**: hover/active/focus from 4.2. `v-tilt` on the `NuxtLink`.
- **Entry**: grid items keep `v-reveal` stagger; image fade-up stays (`.shot.in`).

### 5.2 StaffCard
Same markup and `.person-card` as PlayerCard (now a `NuxtLink` only if a staff page exists; otherwise `<article tabindex="-1">` with hover effects still applied) with:
- `--accent: var(--rv-green-ui)`, `--lift-shadow: var(--shadow-lift-green)`; portrait uses `.stage--staff`.
- Top-left chip: `AppIcon shield` 14px + "STAFF" (12px, 600, .12em).
- Eyebrow role in `--rv-green-ui`; long roles clamp to 2 lines.
- No number. No photo: crest `/brand/logo.png` 40% width centred at 35% top, opacity .18, + initials Anton 34cqw cream .5. Drop "Foto in arrivo".
- `v-tilt` applied. Staff now animates identically to players.

### 5.3 PlayerPortrait (stage)
- Prop `stage?: 'player' | 'staff'` (default player) → adds `.stage--staff`.
- Variant `portrait`: aspect 4/5 (was 3/4); img `object-fit: contain; object-position: bottom center; height: 96%` so the head sits ~8% from top.
- Variant `thumb` is no longer rendered by PlayerPortrait: all round faces use `PlayerAvatar` (5.5).
- Image entry unchanged (`translateY(6%) scale(.98)` → none, 700ms ease-out). Add `filter: drop-shadow(0 18px 24px rgb(0 0 0 / .55))` on `.shot`.

### 5.4 Profile hero (`pages/team/[slug].vue`)
Poster composition: the bust fills the hero, surname is huge and overlaps the torso, giant number behind, stats bar built into the hero bottom.

**Desktop ≥1051** (hero width ≈ content width):
- Box: height 560px, radius `--r-panel`, `.stage` + `.stage-aurora`, `--stage-fade: var(--rv-black)`, `--ring-size: 620px; --ring-top: -40px; --spot-y: 34%`. Ring and spot centred on the player: set `--stage-x`-style centre by putting the ring `left: 66%` (override `left` on `.hero.stage::before`).
- Player: `PlayerPortrait bare plain variant="portrait"` positioned `right: 4%; bottom: 0; height: 108%; aspect-ratio: 4/5` (head crops a few px above the box = poster feel; `overflow: hidden` on the hero). Bottom 22% masked: `mask-image: linear-gradient(180deg, #000 72%, transparent 100%)`.
- Giant number: `.outline-text.outline-text--fill`, Anton 520px, `right: 30%; top: -40px`, z 0 (behind player, peeks left of the shoulder).
- Identity block, left 48px, bottom 128px, z 4 (above the image where they overlap):
  - Chip row: position chip (orange-soft bg, orange text, icon `ball`), captain chip (gold-soft bg, gold, icon `armband`), MVP badge if any. Chips 32px high, 12px/600 uppercase.
  - First name: Anton 48px `--rv-cream-2`.
  - Surname: Anton `--fs-mega`, line-height .85, `text-shadow: 0 4px 40px rgb(0 0 0 / .6)`. It is allowed to run under/over the player's arm.
  - Nickname: Geist 18px italic-free, muted, in quotes.
- Stats strip: inside the hero, `position: absolute; left: 24px; right: 24px; bottom: 24px;` height 88px, `--rv-glass` + `backdrop-filter: blur(16px)`, 1px `--rv-line-strong`, radius 16. Four cells (Presenze, Gol, Assist, MVP) separated by 1px lines: value Anton 44px (count-up), label 12px uppercase muted. Number cell first: `#1` Anton 44px orange (moves the shirt number here; delete the separate `.num`).
- Secondary stats (Vittorie, Gol a partita, Presenza) below the hero: 3 compact `StatCard`s in a row, value 40px, in `.panel`s, gap 16, margin-top 24.

**Phone (390)**:
- Hero full-bleed: `margin-inline: calc(var(--gutter) * -1)`, radius 0, height 540px.
- Player: centred, `left: 50%; translate: -50% 0; height: 82%; bottom: 120px` region (bust occupies top 3/4), same bottom mask.
- Giant number: Anton 300px, top 8px, right −12px.
- Identity block: left 20px, bottom 132px, surname Anton 64px (min) to 76px, first name 28px. Chips above, 28px high.
- Stats strip: left/right 12px, bottom 16px, height 76px, 4 cells, value Anton 32px. `#N` cell stays first.
- Back link becomes a 40px glass round button with `arrow-left` icon, absolutely placed top-left inside the hero (16px inset), `aria-label="Torna alla squadra"`. Desktop: same button, 44px.

**Animation** (page load, once): `.stage-aurora` drift; player `hero-rise` (opacity 0→1, translateY 32px→0, scale .96→1, 900ms ease-out, delay 80ms); giant number `num-slide` (translateX −48px→0, opacity 0→1, 1000ms ease-out); identity `.intro d1–d3`; stats strip `enter` 700ms delay 300ms then StatCard count-up. Reduced motion: all final state immediately.

### 5.5 PlayerAvatar (new `components/PlayerAvatar.vue`, replaces every round `thumb`)
- **Props**: `first, last, photoPath, size: 40|48|56|72 = 48, status?: 'available'|'maybe'|'unavailable'|'none', ring?: 'orange'|'gold'|'none'`.
- **Anatomy**: `<span class="av">` circle → inner mini stage (`radial-gradient(70% 70% at 50% 30%, rgb(253 127 16 / .28), transparent 70%), #15170f`) → `<img>` → optional status badge.
- **Centring (engineering fix)**: img `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 12%; transform: scale(1.18); transform-origin: 50% 22%`. Thumb asset itself must be face-centred (regenerate from `player-faces.json` x; verify in `build-player-assets.sh`). Faces must sit within the central 60% horizontally; check every player at 48px.
- **Ring**: 2px gap + 2px ring via `box-shadow: 0 0 0 2px var(--rv-black), 0 0 0 4px var(--ring-c)`. `--ring-c`: available green, maybe amber, unavailable red, orange/gold per prop. `none`: `outline: 2px dashed var(--rv-line-strong); outline-offset: 2px;` image `filter: grayscale(1); opacity: .55`.
- **Status badge** (only when `status` set and ≠ none): 18px circle bottom-right (−2px), fill = status colour, 2px `--rv-black` border, `AppIcon` 12px black: `check` / `question` / `x`. Shape carries meaning.
- **Fallback**: initials Anton 40% of size, muted, on the mini stage.
- **Hover** (when inside a link/button, pointer only): `translate: 0 -2px; scale: 1.06`, 240ms spring.
- **Change of status**: ring colour transitions 200ms; badge pops `scale .6→1` 280ms `--ease-spring`.

### 5.6 HomeHero
- Box: `.stage` + `.stage-aurora`, radius `--r-panel`, no border, `--stage-fade: var(--rv-black)`, ring `--ring-size: 760px; --ring-top: -120px`. Heights 340 phone / 420 tablet / 480 desktop. Phone: full-bleed (negative gutter margins, radius 0).
- Floor: add `.floor` span: `position:absolute; left:10%; right:10%; bottom:-30px; height:80px; background: radial-gradient(50% 50% at 50% 50%, rgb(0 0 0 / .7), transparent); z 1` so players stand on something.
- Background word: "RALL VENEZIA" `.outline-text`, stroke `.18` alpha, 1 line, Anton `clamp(96px, 18vw, 240px)`, bottom 8%, centred, behind players.
- Copy top-left (24px / 40px desktop): eyebrow chip `AppIcon calendar` + "Matchday · lun 16 nov" if a match is ≤7 days away else "Clubhouse"; `h1` "Ciao Daniele" Anton clamp(44px, 9vw, 96px).
- Crest top-right 64 / 96px, float 6s kept.
- Squad row unchanged in logic; each player hover (pointer): `translateY(-8px)` + brightness 1.08, 300ms; others in row dim to `opacity .7` (`.squad:hover .p:not(:hover)`). Parallax kept.
- Reduced motion: no float, no aurora, no parallax.

### 5.7 TickerBar
- Dark bar, 40px high, `--rv-surface` bg, bottom 1px `--rv-line`. Left fixed tag: orange block (ink black) 40px high, padding 0 14px, crest 20px + "RALL" Anton 16px; right edge of tag has a 12px skewed cut (`clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)`).
- Track: masked edges `mask-image: linear-gradient(90deg, transparent, #000 32px, #000 calc(100% - 32px), transparent)`.
- Item: `AppIcon` 16px orange + label 12px/700 uppercase .1em orange + value 14px/600 cream. Items: `calendar` Prossima, `whistle` Ultima (score Anton 16px), `ball` Capocannoniere, `form` Forma (render W/D/L as 18px mini pills, not letters in text). Separator: 4px `--rv-line-strong` dot, 24px each side.
- Motion: `marquee` 44s linear infinite; pause on `:hover` and `:focus-within`. Reduced motion: static, horizontally scrollable, one set.

### 5.8 WidgetFrame (all widgets)
- `.panel` (new recipe), gap 16.
- Header: `AppIcon` 18px orange + title Geist 13px/700 uppercase .12em cream (not muted) ; right: link chip (32px high, padding 0 12px, radius pill, `--rv-surface-3` bg, 13px/600 cream, trailing `arrow-right` 14px; hover bg `--rv-orange-soft`, text orange, arrow `translateX(3px)`).
- New prop `icon: IconName` (required). Bare widgets show the same header above their custom card (title outside the card).
- Skeleton unchanged.

### 5.9 NextMatch poster (`NextMatchWidget`)
- Card: `.stage` (ring `--ring-size: 520px; --ring-top: -160px`, ring left 70%), radius `--r-panel`, padding 32/24 phone, min-height 340 desktop / 380 phone. No orange left border. `--stage-fade: transparent`.
- Top row: chips `AppIcon trophy` competition, `AppIcon home|plane` "In casa"/"Trasferta". Matchday: chip turns orange with `live-dot` "Oggi si gioca".
- Matchup (centre): two columns + VS. Each: crest/badge 72px (desktop 96) — `ClubLogo` / `OpponentBadge` — and name Anton 28px (desktop 44). VS: Anton 20px orange in a 40px ring (1px orange-line). Phone: badges 56, names 24, stacked in a 3-col grid `1fr auto 1fr`, centred text.
- Bottom: left `AppIcon calendar` day (Geist 16 cream) + time Anton 40 orange + `AppIcon pin` venue (14 muted). Right: countdown 4 tiles 64×72, `--rv-glass` + blur 12, radius 12, value Anton 36 tabular, unit 11px… use 12px min (`--fs-cap`). Seconds value orange with `tick` transition.
- Hover: shine sweep (keep), ring scale 1.04, border `--rv-orange-line`. Watermark crest removed (the ring replaces it).
- Phone: countdown full-width row of 4 equal tiles below date.

### 5.10 AvailabilityWidget ("Chi c'è", icon `users-check`)
- Faces grid: `repeat(auto-fill, minmax(64px, 1fr))`, gap 12 / 8. Each: `PlayerAvatar size=56 (48 phone)` with `status`, below it last name 12px/600 cream, ellipsis. Sorted: available, maybe, unavailable, none (then by shirt number).
- Summary (restyle `AvailabilitySummary`): stacked bar 8px radius pill (green/amber/red/line segments, widths animate 600ms ease-out), then 4 inline counters: icon badge 20px + Anton 28 number + 12px label.
- `AvailabilitySelector`: 3 buttons 52px, radius 12; selected fills with status colour, ink black, icon + label; press `scale .97` then spring back.

### 5.11 LastResult (icon `whistle`)
- Card: radius `--r-panel`, `--panel-bg`, glow `radial-gradient(70% 80% at 85% 0%, color-mix(in srgb, var(--glow) 30%, transparent), transparent 70%)` + `--noise`; 1px border tinted by result (45% mix). Remove `.grain`.
- Top: date chip; result pill right: 32px high, status colour bg, ink black, letter + word ("V · VITTORIA").
- Score: two columns RV / opponent each with badge 48 + name Anton 20; score Anton `clamp(80px, 14vw, 132px)` centred, separator a 24×6 rounded bar in muted. Score reveal kept.
- Footer: scorer chips (`AppIcon ball` 14 + surname + ×n), MVP badge right.
- Hover: lift −3px + shadow.

### 5.12 RecentMatches (icon `list`) + MatchCard row
- FormStrip: 28px pills with letter, oldest→newest, newest has 2px orange outline ring.
- MatchCard row: 64px high, radius 14, `--rv-surface-2`, padding 12/16. Left: opponent badge 40. Middle: opponent name only, 16px/600 (one line, ellipsis); meta 13px muted: `formatShortDay` · "Casa"/"Trasferta" (with `home`/`plane` 14px icon). Right: score Anton 28 (RV score first, always) + result pill 28. Fixes the 3-line wrap on phone.
- Hover: bg `--rv-surface-3`, `translateX(2px)`; active scale .99.

### 5.13 Record donut (icon `chart`)
- Ring 132px (phone 112), stroke 10, `stroke-linecap: round`, gap 6 units between segments; track `--rv-surface-3`. Centre: played Anton 44 + "partite".
- Draw animation per segment, staggered 120ms, 1100ms ease-out; respects reduced motion.
- Legend: 3 mini tiles (V / N / P) in a row under the ring on phone and in side column; each: 4px top border status colour, Anton 32 value, 12px label. Goal difference chip: `+25` green-soft bg/green text (red if negative), with "Gol 62–37" muted.

### 5.14 TopPerformers ("Migliori", icon `star`)
- Three rows, each a mini-stage tile 88px high: radius 14, left half background is a compact `.stage` (no ring, `--spot-y: 40%`) holding `PlayerAvatar size=64 ring=orange|gold`.
- Right: label chip with icon (`ball` Capocannoniere, `assist` Re degli assist, `star` MVP), value Anton 40 count-up, name 14/600.
- MVP tile: gold ring, gold label, `--rv-gold-soft` wash.
- Hover: lift −2px, avatar scale 1.06.

### 5.15 TopScorers (icon `ball`)
- Rows 52px: position Anton 20 (1 = gold), `PlayerAvatar 40` (leader 48 ring gold), name 14/600 + bar 6px (radius 3, grow 900ms staggered 90ms), value Anton 28.
- Ties: show "=" before repeated positions (e.g. "=3").
- Row hover: bg `--rv-surface-2`, radius 10.

### 5.16 Poll (icon `calendar-check`)
- Range title Anton 28 cream with orange dash.
- Day chips: 5-col grid, min-height 140, radius 14, `--rv-surface-2`, 1px line. Selected: `background: linear-gradient(180deg, rgb(253 127 16 / .28), rgb(253 127 16 / .08))`, border orange, check icon 14 top-left. Best day: gold border + `star` icon 14 top-right (replaces ★ glyph). Vertical bar 10×56, radius pill.
- Tap: `scale .96` then spring back 280ms `--ease-spring`. Count `tick` kept.
- Footer: `AppIcon users` + "6 risposte" · best day text.

### 5.17 Announcement ("Bacheca", icon `megaphone`)
- Card (`NuxtLink`): radius `--r-panel`, `--panel-bg`, 1px line, padding 24, glow `radial-gradient(60% 70% at 100% 0%, var(--rv-orange-soft), transparent 70%)`, 3px top accent `linear-gradient(90deg, var(--rv-orange), transparent 70%)`.
- Top: icon tile 40px radius 12 `--rv-orange-soft` with `megaphone` orange; next to it chip "In evidenza" (`pin` icon, orange) or "Dallo spogliatoio" (muted) + date.
- Title Anton 28 (phone 24) cream, line-height 1. Body Geist 16/1.55 `--rv-cream-2`, clamp 4 lines. Footer link chip "Apri la bacheca →".
- Hover: lift −3px, shadow, arrow nudge. Same restyle applies to `AnnouncementCard` (full list page) minus the clamp and link chip.

### 5.18 Gazzetta widget (icon `news`)
See 6.4.

---

## 6. Gazzetta redesign

### 6.1 Data and categories
- `useNews` select adds `source, match_id`. New pure util `newsCategory(a)` in `app/utils/news.ts` (unit-tested):
  - `source === 'instagram'` → `instagram` ("Instagram", icon `instagram`, pink accent is NOT used: orange chip)
  - else `match_id` → `match` ("Partita", icon `whistle`)
  - else → `club` ("Club", icon `megaphone`)
- `kicker` stays as free text shown after the chip ("Partita · Giornata d'apertura").
- Reading time: `Math.max(1, Math.round(words / 200))` min.

### 6.2 `NewsChip.vue` (new)
Pill 28px, padding 0 10px, radius pill, `--rv-glass` + blur 8 (on images) or `--rv-surface-3` (on cards); `AppIcon` 14 orange + label 12px/700 uppercase .1em cream.

### 6.3 `NewsCard.vue` (new; replaces NewsStory). Variants:
- `lead`: full-width card, radius `--r-panel`, overflow hidden. Cover aspect 16/9 phone, 21/9 desktop (max-height 520). Overlay `linear-gradient(180deg, transparent 30%, rgb(11 11 9 / .55) 55%, rgb(11 11 9 / .95) 100%)`. Content at bottom (24 phone / 40 desktop): chip + kicker, title Anton clamp(36px, 5.2vw, 80px) line-height .95 max 18ch, summary Geist 18 `--rv-cream-2` (desktop only on image; phone below image), meta row. Phone: title over image bottom, summary + meta below on `--rv-surface`.
- `card`: radius `--r-card`, `--rv-surface`, 1px line; cover 16/10 with chip top-left (12px inset); body padding 16/20: kicker eyebrow orange, title Anton 26 line-height 1 (clamp 3 lines), summary 15/1.5 muted clamp 2, meta.
- `row`: 88px; thumb 96×72 radius 10 left; chip-less: icon 16 + title 16/600 (2 lines) + meta 13 muted.
- **Meta row**: `clock` 14 + "3 min" · date `formatShortDay`; 13px muted.
- **No cover fallback** (all variants): `.stage` with `--ring-size: 140%`, the category icon at 30% of height drawn 1.5px orange-line centred, crest 20% opacity bottom-right. Never a blank or beige box.
- **Hover** (card/lead/row): image `scale(1.04)` 600ms ease-out, card lift −4px + `--shadow-lift` (lead: image zoom only), title gets `text-decoration: underline 2px orange-line` with 4px offset. Whole card is one link (`<NuxtLink>` wraps; inner text is not nested links).
- Loading image: `NewsCover` background `--rv-surface-2` (not `#d9cfba`), fade in 400ms.

### 6.4 Gazzetta home widget (`NewsWidget`)
- `useNews(3)`. Header: `news` icon + "Gazzetta" + link chip "Tutte le notizie".
- Body: first item `NewsCard variant="card"` (cover 16/9 inside the main column, title Anton 30), then items 2–3 as `row`, separated by 1px line. Bare=false (inside panel).

### 6.5 Index (`pages/news/index.vue`)
- No paper wrapper. Page header (`PageHero`): eyebrow chip `news` "Gazzetta", h1 Anton "Notizie" `--fs-display`, lead "Partite, club e spogliatoio." Remove sr-only h1.
- Filter row: `Segmented`-styled chips (scrollable on phone, no wrap): Tutte · `whistle` Partite · `megaphone` Club · `instagram` Instagram. Client-side filter by `newsCategory`; state in `?cat=` query. Swap with `vanish`.
- Layout: lead (`frontPage().lead`) → grid of `card` (1 col phone, 2 col ≥701, 3 col ≥1051, gap 16/24) for the next 6 → "Altre notizie" (`SectionHeader`) list of `row`, 2 cols ≥1051.
- Empty: `EmptyState` with `news` icon, "Nessuna notizia. La redazione è in ritiro."
- Entry: lead `.intro`, grid items `v-reveal` stagger.

### 6.6 Article (`pages/news/[slug].vue`)
- Top bar: glass round back button (`arrow-left`, "Torna alle notizie") + category chip.
- Hero: cover full-bleed on phone (16/10), desktop 21/9 inside content radius `--r-panel` with lead overlay gradient; title over the image bottom on desktop (Anton clamp(40px, 5vw, 84px), max 20ch); on phone title sits below the image, Anton 40. No cover → stage fallback (6.3) at 21/9 desktop / 4/3 phone.
- Meta row under hero: author initials avatar 32 (orange-soft bg) + "di Staff" 14/600 · `calendar` date · `clock` reading time.
- Column: `max-width: 68ch; margin-inline: auto` (desktop also offset-left aligned with title is fine: choose centred).
  - Standfirst (`summary`): Geist `--fs-lead`/1.5, `--rv-cream`, 600 weight, 1px orange-line left border, padding-left 16.
  - Body: Geist `--fs-article`/1.7, `--rv-cream-2`, paragraphs gap 20. Single column, no drop cap.
- Related actions (stacked cards, 72px, radius 14, `--rv-surface-2`, chevron right):
  - Match: `whistle` icon tile + "Rall Venezia vs Monza" + "Vai alla partita".
  - Instagram (`external_url` https only, existing check): `instagram` icon tile + "Guarda il post" + `external` icon; `target=_blank rel=noopener noreferrer`.
- Footer: "Altre notizie" — 3 `card`s (exclude current), horizontal scroll rail on phone (snap, 80% width cards).
- Entry: hero image `scale(1.04)→1` + fade 900ms; title `.intro d1`.

---

## 7. Icons (`AppIcon.vue`)

24×24 viewBox, stroke 1.8, round caps/joins, `currentColor`, `aria-hidden`. Add a `size` prop (default 24) that sets width/height. Paths may contain several subpaths; circles drawn as arcs in `d`.

| Name | Drawing idea | Used in |
| --- | --- | --- |
| `news` | folded page: rect 4,5→18,19 + right flap 18,9→20,9→20,18a1 1 0 0 1-2 1; 3 text lines; small image box top-left | nav "Gazzetta", Gazzetta header/chips, empty state |
| `instagram` | rounded square r5 (3,3→21,21), circle r4 centre, dot at 17,7 | category chip, article CTA, admin list |
| `whistle` | circle r4.5 at 9,14 + mouthpiece rect 12,8→21,11 + lanyard loop 5,9 | match-report category, Last result, ticker "Ultima" |
| `megaphone` | cone 4,10→14,5→14,19→4,14 z + handle 7,14→8,19 + 2 sound arcs at right | club category, Bacheca, announcements page |
| `pin` | push-pin: head 9,3→15,3, body taper to 12,13, needle 12,13→12,21 | "In evidenza" chip |
| `calendar` | existing `matches` path | dates, hero eyebrow, ticker "Prossima" |
| `calendar-check` | `calendar` + check 9,15 11,17 15,13 | Poll |
| `clock` | circle r9 + hands 12,7→12,12→15,14 | reading time, kickoff time |
| `map-pin` | teardrop 12,21 from circle r3 at 12,10 | venue |
| `home` | existing | "In casa" chip |
| `plane` | simple plane silhouette diagonal | "Trasferta" chip |
| `ball` | circle r9 + centre pentagon + 5 short spokes to rim | goals, Capocannoniere, scorer chips, position chip |
| `assist` | curved arrow from 4,18 arcing to 18,6 + arrow head | Re degli assist |
| `star` | 5-point star | MVP, poll best day |
| `trophy` | cup + handles + base | competition chip |
| `armband` | band rect 4,9→20,15 rotated look + letter "C" arc inside | captain chip |
| `shield` | crest shield 12,3 → 20,6 → 19,14 q -3,5 -7,7 q -4,-2 -7,-7 L4,6 z | staff chip |
| `users` | existing `team` path | poll respondents |
| `users-check` | `team` left figure + check at right | Chi c'è |
| `chart` | existing `stats` path | Record widget |
| `list` | 3 bullets + lines | Recent matches |
| `form` | zig-zag trend line 3,16 8,11 12,14 21,6 | ticker "Forma" |
| `check`, `question`, `x` | check 5,12 10,17 19,7 · question mark curve + dot · two diagonals (existing `close`) | availability badges/selector, poll |
| `arrow-right`, `arrow-left`, `chevron-right` | standard | link chips, back buttons, CTA rows |
| `external` | box with arrow out of top-right | Instagram link |

Nav: give "Gazzetta" the `news` icon in `DesktopNavigation`, mobile menu, and include it in the same list as the other items (it currently floats alone without icon).

---

## 8. Accessibility

- **Contrast** (checked targets): cream on `--rv-surface` 15:1; `--rv-muted` on `--rv-surface` 6.6:1; orange on black 7.9:1; black on orange 7.9:1; `--rv-green-ui` on surface 7.6:1; gold on surface 8.6:1. Text over photos only inside the overlay zone where gradient alpha ≥ .85 (lead card, article hero); verify the darkest-photo case.
- Glass surfaces must keep ≥ 4.5:1 for their text: the `--rv-glass` alpha .72 over the stage is the minimum; never lower.
- **Focus**: 2px orange ring, offset 2–3px, on every card link, chip, filter, avatar button, back button. Staff cards use green ring. Cards with `overflow:hidden` put focus ring via `outline` on the link itself (outline is not clipped by its own overflow).
- **Not colour only**: availability uses badge icons + sr-only text; results use letters; categories use icon + label; poll best day uses star icon + `aria-label`.
- **Motion**: every loop (aurora, crest float, ticker, live-dot, MVP glow) stops under `prefers-reduced-motion`; tilt and parallax disabled; counts show final values; reveals not hidden. Ticker pauses on hover/focus and is `role="marquee"` with the duplicate set `aria-hidden`.
- Headings: one `h1` per page (profile surname block is the h1 with first + last name; Gazzetta index "Notizie"; article title).
- Touch targets ≥ 44px (chips in filter row 40px high + 4px margin hit area via padding).
- Decorative: ring, aurora, outlined numbers, floor, crest watermark are `aria-hidden` / pseudo-elements. Avatars: `alt=""` when the name is printed next to them; otherwise `alt="Nome Cognome"`.

---

## 9. Build plan (Sonnet-sized steps)

Each step: implement, run `pnpm lint && pnpm typecheck && pnpm test`, check 390 and 1440 screenshots of the touched pages, commit. "Owns" = files the step may edit.

| # | Step | Owns | Depends on |
| --- | --- | --- | --- |
| 1 | **Tokens + stage + deletions**: section 2 tokens, new `.panel`, section 3 stage/aurora/outline, remove `.stripes`, paper tokens, serif font imports; login/error use stage | `tokens.css`, `components.css`, `base.css`, `nuxt.config.ts`, `package.json`, `layouts/auth.vue`, `error.vue` | – |
| 2 | **Icons**: all icons of section 7, `size` prop, nav Gazzetta icon | `AppIcon.vue`, `DesktopNavigation.vue`, `MobileTopBar.vue`/menu, `useNav.ts` | – (parallel with 1) |
| 3 | **PlayerAvatar** + thumb centring (verify/regenerate thumbs, `object-position`) | `PlayerAvatar.vue` (new), `scripts/build-player-assets.sh`, `scripts/player-faces.json` | 1 |
| 4 | **Card language**: `v-tilt` plugin + `.person-card` CSS | `plugins/tilt.client.ts` (new), `components.css` (append only) | 1 |
| 5 | **PlayerCard + StaffCard + PlayerPortrait** (5.1–5.3) | `PlayerCard.vue`, `StaffCard.vue`, `PlayerPortrait.vue`, `pages/team/index.vue` | 2, 4 |
| 6 | **Profile hero** (5.4) | `pages/team/[slug].vue`, `StatCard.vue` (size prop only) | 2, 5 |
| 7 | **HomeHero + TickerBar** (5.6, 5.7) | `HomeHero.vue`, `TickerBar.vue` | 1, 2 |
| 8 | **WidgetFrame + NextMatch + LastResult + RecentMatches/MatchCard/FormStrip** (5.8, 5.9, 5.11, 5.12) | `WidgetFrame.vue`, `NextMatchWidget.vue`, `LastResultWidget.vue`, `RecentMatchesWidget.vue`, `MatchCard.vue`, `FormStrip.vue`, `ResultPill.vue`; add `icon` to every widget's `WidgetFrame` call | 1, 2 |
| 9 | **Availability + Record + TopPerformers + TopScorers + Poll** (5.10, 5.13–5.16) | those 5 widgets, `AvailabilitySummary.vue`, `AvailabilitySelector.vue`, `PollVote.vue` | 3, 8 |
| 10 | **Announcement** (5.17) | `AnnouncementWidget.vue`, `AnnouncementCard.vue`, `pages/clubhouse/announcements.vue`, `pages/clubhouse/index.vue` | 2, 8 |
| 11 | **Gazzetta core**: `newsCategory` util + test, `useNews` select, `NewsChip`, `NewsCard`, `NewsCover` restyle; delete `NewsMasthead`, `NewsStory` | `utils/news.ts` (new), `tests/unit/news.spec.ts`, `composables/useNews.ts`, `NewsChip.vue`, `NewsCard.vue`, `NewsCover.vue` | 1, 2 |
| 12 | **Gazzetta index** (6.5) | `pages/news/index.vue` | 11 |
| 13 | **Article** (6.6) | `pages/news/[slug].vue` | 11 |
| 14 | **Gazzetta widget** (6.4) | `widgets/NewsWidget.vue` | 8, 11 |
| 15 | **Docs + motion tests + QA**: update `DESIGN_SYSTEM.md` (stage, tokens, icons, Gazzetta, delete v2 stripe/paper text), extend `tests/e2e/motion.spec.ts` (aurora/tilt/ticker off under reduced motion), screenshot pass 390/1440 for home, team, profile, news, article, poll | `docs/DESIGN_SYSTEM.md`, `tests/e2e/*` | all |

Independent groups after step 1+2: {3→9}, {4→5→6}, {7}, {8→10}, {11→12, 13}; 14 needs 8 and 11.

**Done when**: no stripes, no cream paper, no serif anywhere (`grep -rn "stripes\|paper\|font-serif\|Source Serif" app` is empty); every widget header and Gazzetta chip has an icon; staff cards tilt/lift like players; profile bust fills ≥ 70% of hero height on both widths; avatar faces centred at 48px for every player.
