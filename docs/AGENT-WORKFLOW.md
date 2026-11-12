# How work is done here (agent workflow)

Adapted from the Shiori project's `docs/AGENT-WORKFLOW.md`. Read this first in a new chat, then `handoff.md`. Durable context lives in files, not in the chat, so a chat can stay small.

**Never push** (or open PRs, deploy, or change Cloudflare/Supabase/Vercel settings) without the owner's explicit approval. Commit locally in scoped commits.

## The loop for every item

1. **Queue, do not switch.** A new request is added to the ordered list in `handoff.md` (id `Q1`, `Q2`…); the item in progress is finished first. Questions may be answered at once.
2. **Design before building anything non-trivial.** An **Opus** agent writes `docs/<TOPIC>-DESIGN.md` (docs only): evidence from real code/data, one recommendation, exact Italian copy, states (empty, thin, error, private), tests, and numbered **Sonnet-sized build steps** with file ownership and which steps are independent. Product questions get a recommended default; do not block on them.
3. **Build with Sonnet or Haiku agents** from the design doc, step by step. Independent tracks run in parallel; steps sharing a file (`tokens.css`, `components.css`, `nuxt.config.ts`) run one after another. Never let two agents edit the same function.
4. **Verify yourself.** The agent's own run is not enough: `typecheck`, `lint`, `test`, `supabase test db`, `build`, and the relevant Playwright specs. A failure that only appears under load is rerun alone before it is blamed on code.
5. **Desktop and mobile never break each other.** Any change for one form factor is re-checked on the other before it is reported done: 1440x900 with a mouse and 390x844 (plus 320 and 360x740) with touch, in Chromium and, for gestures, WebKit. Scope phone-only behaviour with media/pointer conditions; specs assert both sides.
6. **Review visually (always for UI).** Use Playwright with real screenshots (saved in the scratchpad), actually look at them, compare neighbouring modules (card anatomy, type, spacing, alignment), fix, re-shoot, then critique with the taste skill (hierarchy, spacing, alignment, repetition, brand) using an Opus agent for anything beyond a small fix. Geometry assertions alone pass ugly UI. Interactive controls are exercised in Playwright (open, close, change, submit, keyboard and touch path) before handoff; record the paths exercised.
7. **Independent Opus review** (read-only) of anything touching **auth, RLS/policies, roles, storage access, invites, secrets or data migrations**: concrete defects only, with `file:line` and a failing scenario, ranked. A Sonnet agent fixes with tests, then re-verify (step 4).
8. **Commit locally** in scoped commits with the `Co-Authored-By` trailer. Update `handoff.md` (state, open work, migrations used) in the same series.

## Model split

| Work | Model |
| --- | --- |
| Design, planning, reviews, audits, screenshot critique, product decisions, anything touching auth, RLS, privacy, migrations | Opus |
| Multi-file implementation from a design doc, new features, refactors, specs, anything with UI that must be reviewed visually | Sonnet |
| Small mechanical work: renames, Italian copy entries, doc reconciliation, ticking handoff items, formatting, grep-and-report scans, one-file edits with exact instructions | Haiku |

Choose the cheapest model that does the job well; escalate after two failures. Give every agent a self-contained brief: repo path, exact doc to read, what not to touch, verify commands, report format and length.

## Standing rules (every brief repeats them)

- **Alignment and layout are shared CSS rules**, not per-page fixes. One left edge; spacing, radius, type, colour and motion come from tokens only. No new one-off values.
- **Shared components are the contract.** A new variant needs a reason; a second pattern for an existing job is a bug.
- **No third-party providers** at runtime: self-hosted fonts, no external scripts, no analytics, no CDN assets.
- **Never invent data.** Unknown shirt numbers/positions are `null`. No sensitive personal details. Tests and fixtures use `@example.invalid` emails; no real accounts or real emails in the repo.
- **RLS is the authorization.** Every `public` table has RLS; the service-role key exists only in server routes; roles never come from the browser.
- **Stats are derived**, never stored as counters.
- **Honest states.** Loading (skeleton), empty (club voice), error and private each look like themselves; a failed write never looks saved.
- **Reduced motion always wins.** Animate `opacity`/`transform` only.
- **UI copy is Italian**, docs and code are English.
- **Production dumps are sensitive.** Never commit, attach or paste them; mask before local use.
- Do not use `git checkout`, `git stash` or `git reset` in a shared tree; use `git worktree add` for comparisons.
- Keep dependencies minimal; prefer native Nuxt/Vue capabilities.

## Where things live

`handoff.md` current state and queue · `docs/*.md` product, architecture, DB, auth, routes, design, deployment, MVP, plan · `docs/*-DESIGN.md` per-feature designs · `docs/*-REVIEW.md` reviews.
