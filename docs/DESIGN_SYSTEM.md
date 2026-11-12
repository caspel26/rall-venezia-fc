# Design system

Direction: a matchday programme, not a dashboard. Near-black, strong oversized type, real photography, sparing orange. Structured like Shiori's UI rulebook: **one tokens block, shared components are the contract, one way to do a thing, honest states, calm motion.** A new component variant needs a reason; a one-off colour, size or radius is a bug.

## Tokens (`app/assets/css/tokens.css`)

### Colour
| Token | Value (starting point) | Job |
| --- | --- | --- |
| `--rv-black` | `#0b0b09` | page (from the crest) |
| `--rv-surface` | `#141414` | panels |
| `--rv-surface-2` | `#1c1c1c` | raised / inputs |
| `--rv-line` | `#2a2a2a` | hairlines |
| `--rv-cream` | `#f3ead8` | primary text, light panels |
| `--rv-muted` | `#9a9384` | secondary text (≥ 4.5:1 on surface; checked) |
| `--rv-orange` | `#fd7f10` | **accent**: primary action (max one per view), current location, live/next match, focus ring |
| `--rv-green` | `#3a9d5d` | secondary: win, available, success (lighter than the crest green so it reads on black) |
| `--rv-green-deep` | `#19522b` | the crest's stripe green: decorative accents |
| `--rv-red` | `#d64545` | loss, unavailable, danger (separate from brand) |
| `--rv-amber` | `#e0a526` | maybe, warning |
| `--rv-gold` | `#d4af37` | MVP, awards, Hall of Fame **only** |

Hex values come from the supplied roundel (winged lion on green and orange stripes). The supplied artwork is 150px, so it is used at ≤ 112px; a higher-resolution or vector original would allow larger placements. The vertical green/orange stripe motif is used as a subtle background pattern (`.stripes`) on the login and error screens. Dark only in MVP (the identity is dark); light theme is not planned. Result colours are one fixed map (W green, D muted, L red) applied through one `ResultPill` component. **Shape first, colour second**: pills carry the letter (V / N / P in Italian UI), never colour alone.

### Type
- Display: condensed grotesque (Anton or Bebas Neue — specimen at Stage 1), uppercase: scores, player names, match titles, MVP, section titles. Self-hosted.
- UI: Geist, sentence case. Weights 450 / 600 / 750.
- Scale tokens: `--fs-cap` 12, `--fs-sm` 14, `--fs-body` 16, `--fs-h3` 20, `--fs-h2` 28, `--fs-h1` 40, `--fs-display` 72, `--fs-score` clamp(72px, 22vw, 168px). Nothing visible below 12px. Inputs ≥ 16px (iOS zoom).
- Numerals in scores and stats are tabular.

### Space, radius, shadow
- Space `--space-1..9` = 4, 8, 12, 16, 24, 32, 40, 48, 64. Section gap 64 desktop / 40 phone. Gutters 16 phone, 40 desktop, content width 1280.
- Radius: `--r-s` 6 (inputs, chips, buttons), `--r-card` 10, `--r-panel` 14, `--r-pill` 999. Football-poster feel favours hard edges: many hero panels are `0`.
- Shadow: one elevation for sheets/dialogs; no card shadows (surfaces separate by tone and hairline).

### Motion (borrowed from Shiori)
`--dur-fast` 120ms, `--dur` 200ms, `--dur-slow` 400ms, `--dur-count` 900ms (stat count-up, score reveal). Easings: `--ease-out` `cubic-bezier(.22,1,.36,1)` for enters/moves, `--ease-in` `cubic-bezier(.4,0,1,1)` for leaves, `--ease-standard` `cubic-bezier(.2,0,0,1)` for state changes. Page transition = short fade/lift (`page-reveal`, `section-arrive` pattern). Sheets slide from the bottom. Signature moments, used once each: score reveal, MVP glow (slow gold pulse, finite), stats count-up on first view. `prefers-reduced-motion: reduce` removes all of it (final values appear immediately). Animate `opacity`/`transform` only.

## Textures and imagery

- Subtle grain overlay (tiled PNG/SVG noise, ≤ 6% opacity) on hero panels only.
- Winged lion: watermark in heroes (≤ 8% opacity, cropped), the login emblem, section divider, and the 404/403 art. Not on every card.
- Photography leads: player portraits are cut-out or duotone-treated on a flat/black ground; match heroes use a darkened photo or the match graphic. Always a defined aspect ratio (`4/5` cards, `16/9` heroes) so layout never shifts; `object-position` stored per image if needed later.
- Fallback for a missing photo: big number + initials on `--rv-surface-2`. Never a grey person icon.

## Layout and responsiveness

Design for 320, 390, 768, 1024, 1440. Breakpoints: 700 (phone) and 1050 (tablet) as in Shiori. Mobile is recomposed, not squeezed: bottom bar nav, full-bleed hero, horizontal rails for secondary shelves, bottom sheets instead of modals. Desktop: left rail, 12-column grid, editorial asymmetry (one wide hero panel + compact side column). No horizontal scroll at any width. Desktop and mobile are re-checked together for every UI change.

Dashboard hierarchy (not twelve equal cards): (1) next-match hero, large, photographic; (2) availability strip directly under it; (3) last result as a big score panel; (4) form + top performers as compact rows; (5) latest pagella and announcement as two smaller panels.

## Components (shared contract)

`ClubLogo`, `OpponentBadge`, `PageHero`, `SectionHeader`, `ScoreBoard` (reveal animation), `MatchCard` (compact + hero variants), `ResultPill`, `FormStrip`, `PlayerCard` (editorial), `StatCard` (big number + label, count-up), `RankingRow`, `MVPBadge` (gold), `RatingCard` (score, review, attribute chips), `AvailabilitySelector` (three big segmented buttons, ≥ 48px, optimistic), `AvailabilitySummary`, `AnnouncementCard`, `MediaCard`, `EmptyState`, `SkeletonBlock`, `Sheet`, `Segmented` (tabs/filters), `MobileBottomNav`, `DesktopNavigation`, `FormField` (label, hint, error wired by `aria-describedby`), `Button` (primary orange / tonal / ghost / danger).

Buttons: min height 44px (48 for primary on mobile), one primary per view. Forms: visible labels, inline errors, no placeholder-as-label, `autocomplete` attributes, correct `inputmode`. Cards: no shadow, hairline border, hover = slight lift of the image only (pointer devices only).

## Copy (Italian)

Empty states: no upcoming match → "Nessuna partita in programma. Per una volta possiamo riposare." · no ratings → "Nessuna pagella ancora. Il giudice è in ritardo." · no media → "Ancora niente qui. Qualcuno carichi una foto." · no availability response → "Nessuna risposta. Il telefono è acceso?"
Errors: 403 "ACCESSO NEGATO — Questa zona dello spogliatoio non è per te." · 404 "FUORI GIOCO — Questa pagina non esiste." · 500 "INFORTUNIO — Qualcosa si è rotto. Riproviamo tra poco."
Login: "RALL VENEZIA FC / ACCESSO ALLO SPOGLIATOIO" with the microcopy "Quello che succede nello spogliatoio resta nello spogliatoio."
Loading uses skeletons shaped like the final content, not spinners.

## Accessibility

Semantic landmarks (`header`, `nav`, `main`), one `h1` per page, visible 2px orange focus ring offset 2px, full keyboard operation of the availability selector and sheets, contrast ≥ 4.5:1 text and 3:1 UI, status never by colour alone, `aria-live` for availability confirmation, images have meaningful `alt` or `alt=""` if decorative, reduced motion respected.
