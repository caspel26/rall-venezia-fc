<script setup lang="ts">
import { hasRole, TEAM_ROLES } from '~/types/domain'
import { resultOf, RESULT_LABEL } from '~/utils/results'

const route = useRoute()
const id = computed(() => String(route.params.id))
const { data, status, error } = useMatchDetail(id)
const { role } = useAuth()

watch(error, (e) => { if (e) showError(createError({ statusCode: e.statusCode ?? 404, statusMessage: e.statusMessage, fatal: true })) }, { immediate: true })

const m = computed(() => data.value?.match)
const done = computed(() => m.value?.status === 'completed')
const isTeam = computed(() => hasRole(role.value, TEAM_ROLES))
const result = computed(() => (m.value && done.value ? resultOf(m.value) : null))
useHead({ title: () => (m.value ? `Rall Venezia vs ${m.value.opponent?.name} · Partite` : 'Partita · Rall Venezia') })

const name = (pid: string | null) => (pid && data.value?.players.get(pid) ? fullName(data.value.players.get(pid)!) : null)
</script>

<template>
  <div class="page">
    <NuxtLink to="/matches" class="muted back">← Partite</NuxtLink>
    <SkeletonBlock v-if="status === 'pending' && !data" size="hero" />

    <template v-else-if="m && data">
      <header class="hero grain intro" :class="{ done }">
        <p class="eyebrow">{{ [m.competition?.name, m.season?.name, formatDay(m.kickoff_at)].filter(Boolean).join(' · ') }}</p>
        <ScoreBoard v-if="done" :rv="m.rv_score" :opp="m.opp_score" :is-home="m.is_home" :opponent="m.opponent?.name ?? ''" />
        <div v-else class="upcoming">
          <p class="vs display">Rall Venezia <span class="x">vs</span> {{ m.opponent?.name }}</p>
          <p class="when">{{ formatTime(m.kickoff_at) }}</p>
        </div>
        <p class="muted">{{ [m.venue, m.is_home ? 'in casa' : 'in trasferta'].filter(Boolean).join(' · ') }}</p>
        <div class="badges">
          <span v-if="result" class="res"><ResultPill :result="result" /> {{ RESULT_LABEL[result].word }}</span>
          <MVPBadge v-for="p in data.mvps" :key="p.id" :name="fullName(p)" />
          <span v-if="m.status === 'postponed' || m.status === 'cancelled'" class="eyebrow">{{ m.status === 'postponed' ? 'Rinviata' : 'Annullata' }}</span>
        </div>
      </header>

      <section v-if="m.status === 'scheduled' && isTeam && data.myPlayerId" class="panel block" aria-labelledby="av-h">
        <h2 id="av-h" class="eyebrow">La tua disponibilità</h2>
        <AvailabilitySelector :match-id="m.id" :current="data.myAnswer" />
      </section>

      <section v-if="data.goals.length" v-reveal class="block">
        <SectionHeader title="Gol" />
        <ol class="timeline">
          <li v-for="g in data.goals" :key="g.id">
            <span class="min display tabular">{{ g.minute != null ? `${g.minute}'` : '–' }}</span>
            <span class="what">
              <strong>{{ g.is_own_goal ? 'Autogol avversario' : name(g.scorer_id) }}</strong>
              <span v-if="g.assist_id" class="muted"> · assist {{ name(g.assist_id) }}</span>
            </span>
          </li>
        </ol>
        <p v-if="data.topScorer && data.topScorer.goals > 1" class="muted hl">
          Migliore in campo sotto porta: <strong>{{ fullName(data.topScorer.player) }}</strong> con {{ data.topScorer.goals }} gol.
        </p>
      </section>

      <section v-if="data.starters.length || data.bench.length" v-reveal class="block">
        <SectionHeader title="Formazione" />
        <div class="lineup">
          <div>
            <p class="eyebrow">Titolari</p>
            <ul class="names"><li v-for="p in data.starters" :key="p.id"><NuxtLink :to="`/team/${p.slug}`"><span class="n display tabular">{{ p.shirt_number ?? '·' }}</span> {{ fullName(p) }}</NuxtLink></li></ul>
          </div>
          <div v-if="data.bench.length">
            <p class="eyebrow">Panchina</p>
            <ul class="names"><li v-for="p in data.bench" :key="p.id"><NuxtLink :to="`/team/${p.slug}`"><span class="n display tabular">{{ p.shirt_number ?? '·' }}</span> {{ fullName(p) }}</NuxtLink></li></ul>
          </div>
        </div>
      </section>


      <section v-if="m.notes" class="block">
        <SectionHeader title="Note" />
        <p class="notes">{{ m.notes }}</p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }
.hero { display: grid; gap: var(--space-3); padding: var(--space-6) var(--space-5); background: var(--rv-surface); border: 1px solid var(--rv-line); border-left: 4px solid var(--rv-orange); border-radius: var(--r-s); }
.hero.done { border-left-color: var(--rv-line); }
.vs { font-size: var(--fs-display); line-height: .95; }
.x { color: var(--rv-orange); font-size: .5em; vertical-align: middle; }
.when { font-size: var(--fs-h1); color: var(--rv-orange); }
.badges { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; }
.res { display: inline-flex; align-items: center; gap: var(--space-2); font-weight: var(--fw-ui); }
.block { margin-top: var(--space-7); }
.timeline { list-style: none; margin: 0; padding: 0; display: grid; }
.timeline li { display: grid; grid-template-columns: 56px 1fr; align-items: baseline; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--rv-line); }
.min { font-size: var(--fs-h2); color: var(--rv-orange); }
.hl { margin-top: var(--space-4); }
.lineup { display: grid; gap: var(--space-5); }
.names { list-style: none; margin: var(--space-2) 0 0; padding: 0; display: grid; gap: var(--space-1); }
.names a { display: flex; align-items: center; gap: var(--space-3); min-height: 44px; text-decoration: none; }
.n { width: 32px; color: var(--rv-orange); font-size: var(--fs-h3); text-align: right; }
.notes { max-width: 70ch; white-space: pre-line; }
@media (min-width: 701px) { .lineup { grid-template-columns: 1fr 1fr; } }
</style>
