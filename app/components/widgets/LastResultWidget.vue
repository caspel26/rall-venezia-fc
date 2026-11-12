<script setup lang="ts">
const { data, status } = useRecentMatches()
const last = computed(() => data.value?.[0])
const result = computed(() => (last.value ? resultOf(last.value) : null))
const mvp = computed(() => last.value?.mvp_awards?.[0]?.player ?? null)
const { data: scorers } = useMatchScorers(() => last.value?.id)
const { data: squad } = useSquad()
const names = computed(() => (scorers.value ?? []).slice(0, 4).map((s) => {
  const p = squad.value?.find((x) => x.id === s.playerId)
  return p ? { name: p.last_name, n: s.n } : null
}).filter((x): x is { name: string; n: number } => !!x))
</script>

<template>
  <WidgetFrame v-if="last || status === 'pending'" title="Ultimo risultato" bare :loading="status === 'pending' && !data">
    <NuxtLink v-if="last" :to="`/matches/${last.id}`" class="res grain" :class="result ? `r-${result.toLowerCase()}` : ''">
      <div class="head">
        <p class="eyebrow">Ultimo risultato · {{ formatShortDay(last.kickoff_at) }}</p>
        <span v-if="result" class="tag display">{{ RESULT_LABEL[result].word }}</span>
      </div>
      <ScoreBoard :rv="last.rv_score" :opp="last.opp_score" :is-home="last.is_home" :opponent="last.opponent?.name ?? ''" />
      <div class="foot">
        <p v-if="names.length" class="sc"><span class="muted">Gol:</span> <span v-for="(s, i) in names" :key="s.name">{{ s.name }}<template v-if="s.n > 1"> ×{{ s.n }}</template><template v-if="i < names.length - 1">, </template></span></p>
        <MVPBadge v-if="mvp" :name="fullName(mvp)" />
      </div>
    </NuxtLink>
  </WidgetFrame>
  <EmptyState v-else-if="status === 'success'" title="Nessun risultato ancora" text="Il primo tre punti è in arrivo." />
</template>

<style scoped>
.res { --glow: var(--rv-muted); display: grid; gap: var(--space-4); padding: var(--space-5); border-radius: var(--r-s); border: 1px solid var(--rv-line); text-decoration: none; color: inherit; background: radial-gradient(80% 90% at 100% 0%, color-mix(in srgb, var(--glow) 32%, transparent), transparent 70%), var(--rv-surface); transition: border-color var(--dur) var(--ease-standard); }
.r-w { --glow: var(--rv-green); border-color: color-mix(in srgb, var(--rv-green) 45%, var(--rv-line)); }
.r-l { --glow: var(--rv-red); border-color: color-mix(in srgb, var(--rv-red) 45%, var(--rv-line)); }
.head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-3); }
.tag { color: var(--glow); font-size: var(--fs-h2); letter-spacing: .04em; }
.foot { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3) var(--space-5); justify-content: space-between; }
.sc { font-size: var(--fs-sm); }
@media (hover: hover) { .res:hover { border-color: var(--glow); } }
</style>
