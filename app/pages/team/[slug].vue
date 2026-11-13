<script setup lang="ts">
import { resultOf } from '~/utils/results'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data, status, error } = usePlayerProfile(slug)

watch(error, (e) => { if (e) showError(createError({ statusCode: e.statusCode ?? 404, statusMessage: e.statusMessage, fatal: true })) }, { immediate: true })

const tabs = [
  { key: 'overview', label: 'Panoramica' },
  { key: 'matches', label: 'Partite' },
]
const tab = ref('overview')

const p = computed(() => data.value?.player)
useHead({ title: () => (p.value ? `${fullName(p.value)} · Rall Venezia` : 'Giocatore · Rall Venezia') })

const c = computed(() => data.value?.career)
const stat = (n: number | null | undefined) => n ?? 0
const decimals = (n: number | null | undefined) => (n == null ? '–' : Number(n).toFixed(2).replace(/\.?0+$/, '').replace('.', ','))
const pct = (n: number | null | undefined) => (n == null ? '–' : `${Math.round(Number(n) * 100)}%`)
</script>

<template>
  <div class="page">
    <div v-if="status === 'pending' && !data"><SkeletonBlock size="hero" /></div>

    <template v-else-if="p">
      <header class="hero stage intro">
        <span class="stage-aurora" aria-hidden="true" />
        <NuxtLink to="/team" class="backbtn" aria-label="Torna alla squadra"><AppIcon name="arrow-left" :size="20" /></NuxtLink>
        <span class="giant outline-text outline-text--fill" aria-hidden="true">{{ p.shirt_number ?? `${p.first_name[0]}${p.last_name[0]}` }}</span>
        <PlayerPortrait class="ph" bare plain :first="p.first_name" :last="p.last_name" :number="p.shirt_number" :photo-path="p.photo_path" variant="portrait" />

        <div class="id">
          <div class="chips">
            <span v-if="p.position" class="pchip"><AppIcon name="ball" :size="14" /> {{ POSITION_LABELS[p.position] }}</span>
            <span v-if="p.is_captain" class="pchip gold"><AppIcon name="armband" :size="14" /> Capitano</span>
            <MVPBadge v-if="stat(c?.mvps) > 0" :name="`${c?.mvps}×`" />
          </div>
          <h1 class="display"><span class="fn">{{ p.first_name }}</span> <span class="ln">{{ p.last_name }}</span></h1>
          <p v-if="p.nickname" class="nick">“{{ p.nickname }}”</p>
        </div>

        <dl class="strip" aria-label="Statistiche in carriera">
          <div v-if="p.shirt_number != null" class="cell"><dd class="v display tabular no">#{{ p.shirt_number }}</dd><dt>Maglia</dt></div>
          <div class="cell"><StatCard label="Presenze" :value="stat(c?.appearances)" /></div>
          <div class="cell"><StatCard label="Gol" :value="stat(c?.goals)" /></div>
          <div class="cell"><StatCard label="Assist" :value="c?.assists_many ? 'TANTI' : stat(c?.assists)" /></div>
          <div class="cell"><StatCard label="MVP" :value="stat(c?.mvps)" /></div>
        </dl>
      </header>

      <section v-reveal class="sec" aria-label="Altre statistiche">
        <div class="panel"><StatCard label="Vittorie" :value="stat(c?.wins)" /></div>
        <div class="panel"><StatCard label="Gol a partita" :value="decimals(c?.goals_per_game)" /></div>
        <div class="panel"><StatCard label="Presenza" :value="pct(c?.attendance)" /></div>
      </section>

      <Segmented v-model="tab" :items="tabs" label="Sezioni del profilo" class="tabs" />

      <section v-if="tab === 'overview'" role="tabpanel" aria-labelledby="tab-overview">
        <SectionHeader title="Stagioni" />
        <div v-if="data?.seasons.length" class="panel table-wrap">
          <table>
            <thead><tr><th>Stagione</th><th>Pres.</th><th>Gol</th><th>Assist</th><th>MVP</th></tr></thead>
            <tbody>
              <tr v-for="s in data.seasons" :key="s.season_id ?? ''">
                <td>{{ s.seasonName }}</td><td>{{ s.appearances }}</td><td>{{ s.goals }}</td><td>{{ s.assists_many ? 'TANTI' : s.assists }}</td><td>{{ s.mvps }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-else title="Ancora nessuna presenza" text="Il campo aspetta." />
      </section>

      <section v-else role="tabpanel" aria-labelledby="tab-matches">
        <ul v-if="data?.matches.length" class="list">
          <li v-for="m in data.matches" :key="m.id">
            <MatchCard :to="`/matches/${m.id}`" :opponent="m.opponent?.name ?? ''" :short="m.opponent?.short_name" :is-home="m.is_home"
              :kickoff-at="m.kickoff_at" :status="m.status" :rv="m.rv_score" :opp="m.opp_score" />
            <p class="muted contrib">
              <span v-if="m.goals">{{ m.goals }} gol</span><span v-if="m.assists"> · {{ m.assists }} assist</span>
              <span v-if="!m.goals && !m.assists">{{ m.isStarter ? 'Titolare' : 'Panchina' }} · {{ resultOf(m) === 'W' ? 'vittoria' : resultOf(m) === 'L' ? 'sconfitta' : 'pareggio' }}</span>
            </p>
          </li>
        </ul>
        <EmptyState v-else title="Nessuna partita giocata" text="Si parte dalla prima." />
      </section>

    </template>
  </div>
</template>

<style scoped>
.hero { --stage-fade: var(--rv-black); --ring-size: 620px; --ring-top: -40px; --spot-y: 34%; position: relative; height: 540px; border-radius: 0; margin-inline: calc(var(--gutter) * -1); margin-top: calc(var(--space-6) * -1); }
.hero::before { left: 62%; }
.backbtn { position: absolute; z-index: 6; top: 16px; left: 16px; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: var(--rv-glass); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); color: var(--rv-cream); box-shadow: inset 0 0 0 1px var(--rv-line-strong); transition: scale 240ms var(--ease-spring), background var(--dur) var(--ease-standard); }
.backbtn:hover { background: var(--rv-orange-soft); scale: 1.08; }
.giant { position: absolute; right: -12px; top: 8px; font-size: 300px; z-index: 0; white-space: nowrap; animation: num-slide 1000ms var(--ease-out) both; }
.ph { position: absolute; left: 50%; bottom: 120px; height: 82%; aspect-ratio: 4 / 5; translate: -50% 0; z-index: 2; -webkit-mask-image: linear-gradient(180deg, #000 72%, transparent 100%); mask-image: linear-gradient(180deg, #000 72%, transparent 100%); animation: hero-rise 900ms var(--ease-out) 80ms both; }
.id { position: absolute; z-index: 4; left: 20px; right: 20px; bottom: 124px; display: grid; gap: 6px; justify-items: start; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.pchip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: var(--r-pill); background: rgb(11 11 9 / .62); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); box-shadow: inset 0 0 0 1px var(--rv-orange-line); color: var(--rv-orange); font: 600 var(--fs-cap)/1 var(--font-ui); letter-spacing: .1em; text-transform: uppercase; }
.pchip.gold { color: var(--rv-gold); box-shadow: inset 0 0 0 1px rgb(212 175 55 / .5); }
h1 { display: grid; line-height: .85; text-shadow: 0 4px 40px rgb(0 0 0 / .6); }
.fn { font-size: 28px; color: var(--rv-cream-2); }
.ln { font-size: clamp(64px, 19vw, 76px); }
.nick { color: var(--rv-muted); font-size: var(--fs-body); }
.strip { position: absolute; z-index: 5; left: 12px; right: 12px; bottom: 16px; height: 76px; margin: 0; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; align-items: center; background: var(--rv-glass); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); box-shadow: inset 0 0 0 1px var(--rv-line-strong); border-radius: var(--r-card); animation: enter 700ms var(--ease-out) 300ms both; }
.cell { display: grid; justify-items: center; padding: 0 4px; height: 100%; align-content: center; }
.cell + .cell { border-left: 1px solid var(--rv-line); }
.cell dt { font-size: var(--fs-cap); color: var(--rv-muted); text-transform: uppercase; letter-spacing: .1em; }
.cell .v { font-size: 32px; line-height: 1; margin: 0; }
.no { color: var(--rv-orange); }
.cell :deep(.eyebrow) { order: 2; text-align: center; font-size: var(--fs-cap); }
.cell :deep(.stat) { display: grid; justify-items: center; gap: 0; }
.cell :deep(.v) { font-size: 32px; line-height: 1; order: 1; }
.sec { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: var(--space-5) 0; }
.sec .panel { padding: 16px; }
.sec :deep(.v) { font-size: 40px; }
.tabs { margin-bottom: var(--space-5); }
.list { display: grid; gap: var(--space-3); list-style: none; padding: 0; margin: 0; }
.contrib { font-size: var(--fs-sm); padding: var(--space-1) var(--space-4) 0; }
.table-wrap { overflow-x: auto; padding: var(--space-3); }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--rv-line); }
th { font-size: var(--fs-cap); color: var(--rv-muted); font-weight: var(--fw-ui); text-transform: uppercase; letter-spacing: .08em; }
@keyframes hero-rise { from { opacity: 0; transform: translateY(32px) scale(.96); } }
@keyframes num-slide { from { opacity: 0; transform: translateX(-48px); } }
@media (min-width: 701px) {
  .hero { height: 560px; border-radius: var(--r-panel); margin-inline: 0; margin-top: 0; }
  .backbtn { width: 44px; height: 44px; }
  .giant { right: 30%; top: -40px; font-size: 520px; }
  .ph { left: auto; right: 4%; translate: none; bottom: 0; height: 108%; }
  .id { left: 48px; bottom: 128px; }
  .fn { font-size: 48px; }
  .ln { font-size: var(--fs-mega); }
  .strip { left: 24px; right: 24px; bottom: 24px; height: 88px; }
  .cell .v, .cell :deep(.v) { font-size: 44px; }
  .sec { gap: 16px; margin-top: 24px; }
}
@media (prefers-reduced-motion: reduce) { .giant, .ph, .strip { animation: none; } }
</style>
