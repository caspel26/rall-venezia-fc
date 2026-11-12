<script setup lang="ts">
import { resultOf } from '~/utils/results'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data, status, error } = usePlayerProfile(slug)

watch(error, (e) => { if (e) showError(createError({ statusCode: e.statusCode ?? 404, statusMessage: e.statusMessage, fatal: true })) }, { immediate: true })

const tabs = computed(() => [
  { key: 'overview', label: 'Panoramica' },
  { key: 'matches', label: 'Partite' },
])
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
    <NuxtLink to="/team" class="muted back">← Squadra</NuxtLink>

    <div v-if="status === 'pending' && !data"><SkeletonBlock size="hero" /></div>

    <template v-else-if="p">
      <header class="hero stage intro">
        <span class="giant outline-text" aria-hidden="true">{{ p.shirt_number ?? `${p.first_name[0]}${p.last_name[0]}` }}</span>
        <div class="id">
          <p class="eyebrow">{{ [p.position ? POSITION_LABELS[p.position] : null, p.is_captain ? 'Capitano' : null].filter(Boolean).join(' · ') }}</p>
          <h1 class="display">{{ p.first_name }} <br>{{ p.last_name }}</h1>
          <p v-if="p.nickname" class="nick muted">“{{ p.nickname }}”</p>
          <p v-if="p.shirt_number != null" class="num display tabular">#{{ p.shirt_number }}</p>
          <MVPBadge v-if="stat(c?.mvps) > 0" :name="`${c?.mvps}×`" />
        </div>
        <PlayerPortrait class="ph" bare plain :first="p.first_name" :last="p.last_name" :number="p.shirt_number" :photo-path="p.photo_path" variant="hero" />
      </header>

      <section v-reveal class="stats" aria-label="Statistiche in carriera">
        <StatCard label="Presenze" :value="stat(c?.appearances)" />
        <StatCard label="Gol" :value="stat(c?.goals)" />
        <StatCard label="Assist" :value="stat(c?.assists)" />
        <StatCard label="MVP" :value="stat(c?.mvps)" />
        <StatCard label="Vittorie" :value="stat(c?.wins)" />
        <StatCard label="Gol a partita" :value="decimals(c?.goals_per_game)" />
        <StatCard label="Presenza" :value="pct(c?.attendance)" />
      </section>

      <Segmented v-model="tab" :items="tabs" label="Sezioni del profilo" class="tabs" />

      <section v-if="tab === 'overview'" role="tabpanel" aria-labelledby="tab-overview">
        <SectionHeader title="Stagioni" />
        <div v-if="data?.seasons.length" class="panel table-wrap">
          <table>
            <thead><tr><th>Stagione</th><th>Pres.</th><th>Gol</th><th>Assist</th><th>MVP</th></tr></thead>
            <tbody>
              <tr v-for="s in data.seasons" :key="s.season_id ?? ''">
                <td>{{ s.seasonName }}</td><td>{{ s.appearances }}</td><td>{{ s.goals }}</td><td>{{ s.assists }}</td><td>{{ s.mvps }}</td>
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
.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }
.hero { --stage-fade: var(--rv-black); position: relative; display: grid; grid-template-columns: minmax(0, 1fr); min-height: 380px; border: 1px solid var(--rv-line); border-radius: var(--r-s); }
.giant { position: absolute; left: -2%; top: 50%; transform: translateY(-48%); font-size: clamp(220px, 46vw, 520px); z-index: 0; white-space: nowrap; }
.id { position: relative; z-index: 3; display: grid; gap: var(--space-2); padding: var(--space-5); align-content: end; justify-items: start; min-height: 220px; }
.id h1 { font-size: var(--fs-display); line-height: .92; text-shadow: 0 2px 24px rgb(0 0 0 / .7); }
.ph { position: absolute; right: 2%; bottom: 0; height: 97%; width: 52%; z-index: 2; }
.num { font-size: var(--fs-h1); color: var(--rv-orange); }
.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-5) var(--space-4); margin: var(--space-6) 0; }
.tabs { margin-bottom: var(--space-5); }
.list { display: grid; gap: var(--space-3); list-style: none; padding: 0; margin: 0; }
.contrib { font-size: var(--fs-sm); padding: var(--space-1) var(--space-4) 0; }
.table-wrap { overflow-x: auto; padding: var(--space-3); }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--rv-line); }
th { font-size: var(--fs-cap); color: var(--rv-muted); font-weight: var(--fw-ui); text-transform: uppercase; letter-spacing: .08em; }
@media (min-width: 701px) {
  .hero { min-height: 440px; }
  .ph { width: 36%; right: 6%; }
  .stats { grid-template-columns: repeat(4, 1fr); }
    }
</style>
