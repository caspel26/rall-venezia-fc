<script setup lang="ts">
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
  <component :is="to ? NuxtLink : 'div'" :to="to" class="mc row" :class="{ link: !!to }">
    <OpponentBadge :name="opponent" :short="short" size="sm" class="badge" />
    <div class="info">
      <p class="t">{{ opponent }}</p>
      <p class="meta"><AppIcon :name="isHome ? 'home' : 'plane'" :size="14" />{{ formatShortDay(kickoffAt) }} · {{ formatTime(kickoffAt) }} · {{ isHome ? 'Casa' : 'Trasferta' }}</p>
    </div>
    <div class="end">
      <template v-if="status === 'completed'">
        <span class="sc display tabular">{{ formatScore(rv) }}–{{ formatScore(opp) }}</span>
        <ResultPill v-if="result" :result="result" />
      </template>
      <span v-else class="eyebrow">{{ status === 'scheduled' ? 'In programma' : status }}</span>
    </div>
  </component>
</template>

<style scoped>
.mc { text-decoration: none; color: inherit; }
.row { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--space-3); min-height: 64px; padding: 12px 16px; border-radius: 14px; background: var(--rv-surface-2); box-shadow: inset 0 0 0 1px var(--rv-line); transition: background var(--dur) var(--ease-standard), transform var(--dur) var(--ease-out); }
.badge { width: 40px; height: 40px; }
.info { min-width: 0; }
.t { font: 600 16px/1.2 var(--font-ui); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--rv-muted); }
.end { display: flex; align-items: center; gap: var(--space-3); }
.sc { font-size: 28px; line-height: 1; }
@media (hover: hover) { .row.link:hover { background: var(--rv-surface-3); transform: translateX(2px); } }
.row.link:active { transform: scale(.99); }
.row.link:focus-visible { outline: 2px solid var(--rv-orange); outline-offset: 2px; }
</style>
