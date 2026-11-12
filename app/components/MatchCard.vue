<script setup lang="ts">
import { resultOf } from '~/utils/results'

const props = defineProps<{
  to?: string
  opponent: string
  short?: string | null
  isHome: boolean
  kickoffAt: string
  venue?: string | null
  competition?: string | null
  status: string
  rv: number | null
  opp: number | null
  variant?: 'hero' | 'row'
}>()

const NuxtLink = resolveComponent('NuxtLink')
const result = computed(() => (props.status === 'completed' ? resultOf({ rv_score: props.rv, opp_score: props.opp }) : null))
</script>

<template>
  <component :is="to ? NuxtLink : 'div'" :to="to" class="mc" :class="[variant ?? 'row', { link: !!to }]">
    <template v-if="variant === 'hero'">
      <ClubLogo class="mark" :size="320" aria-hidden="true" />
      <p class="eyebrow">Prossima partita<template v-if="competition"> · {{ competition }}</template></p>
      <p class="vs display">Rall Venezia <span class="x">vs</span> {{ opponent }}</p>
      <p class="when">{{ formatDay(kickoffAt) }} · <strong>{{ formatTime(kickoffAt) }}</strong></p>
      <p v-if="venue" class="muted">{{ venue }} · {{ isHome ? 'in casa' : 'in trasferta' }}</p>
    </template>
    <template v-else>
      <OpponentBadge :name="opponent" :short="short" size="md" />
      <div class="info">
        <p class="t">{{ isHome ? 'Rall Venezia' : opponent }} <span class="muted">vs</span> {{ isHome ? opponent : 'Rall Venezia' }}</p>
        <p class="muted sm">{{ formatShortDay(kickoffAt) }} · {{ formatTime(kickoffAt) }}<template v-if="competition"> · {{ competition }}</template></p>
      </div>
      <div class="end">
        <template v-if="status === 'completed'">
          <span class="sc display tabular">{{ formatScore(rv) }}–{{ formatScore(opp) }}</span>
          <ResultPill v-if="result" :result="result" />
        </template>
        <span v-else class="eyebrow">{{ status === 'scheduled' ? 'In programma' : status }}</span>
      </div>
    </template>
  </component>
</template>

<style scoped>
.mc { text-decoration: none; color: inherit; }
.hero { position: relative; overflow: hidden; display: grid; gap: var(--space-2); padding: var(--space-6) var(--space-5); background: var(--rv-surface); border: 1px solid var(--rv-line); border-left: 4px solid var(--rv-orange); border-radius: var(--r-s); isolation: isolate; }
.hero .mark { position: absolute; right: -60px; bottom: -70px; opacity: .07; z-index: -1; }
.vs { font-size: var(--fs-display); line-height: .95; }
.x { color: var(--rv-orange); font-size: .5em; vertical-align: middle; }
.when { font-size: var(--fs-h3); }
.row { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-4); border: 1px solid var(--rv-line); border-radius: var(--r-card); background: var(--rv-surface); transition: border-color var(--dur) var(--ease-standard); }
.row.link:hover { border-color: var(--rv-muted); }
.info { min-width: 0; }
.t { font-weight: var(--fw-ui); }
.sm { font-size: var(--fs-sm); }
.end { display: flex; align-items: center; gap: var(--space-3); }
.sc { font-size: var(--fs-h2); }
</style>
