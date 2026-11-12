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
  <WidgetFrame v-if="last || status === 'pending'" title="Ultimo risultato" icon="whistle" bare :loading="status === 'pending' && !data">
    <NuxtLink v-if="last" :to="`/matches/${last.id}`" class="res lift" :class="result ? `r-${result.toLowerCase()}` : ''">
      <div class="head">
        <span class="chip-i"><AppIcon name="calendar" :size="14" />{{ formatShortDay(last.kickoff_at) }}</span>
        <span v-if="result" class="pill-r display">{{ RESULT_LABEL[result].letter }} · {{ RESULT_LABEL[result].word }}</span>
      </div>
      <div class="board">
        <div class="team"><ClubLogo :size="48" /><p class="nm display">Rall Venezia</p></div>
        <p class="score display tabular" :aria-label="`${last.rv_score} a ${last.opp_score}`"><span class="d d1">{{ formatScore(last.rv_score) }}</span><span class="bar" aria-hidden="true" /><span class="d d2">{{ formatScore(last.opp_score) }}</span></p>
        <div class="team"><OpponentBadge :name="last.opponent?.name ?? ''" :short="last.opponent?.short_name" size="sm" /><p class="nm display">{{ last.opponent?.name }}</p></div>
      </div>
      <div class="foot">
        <ul v-if="names.length" class="scorers" aria-label="Marcatori">
          <li v-for="s in names" :key="s.name" class="chip-i"><AppIcon name="ball" :size="14" />{{ s.name }}<template v-if="s.n > 1"> ×{{ s.n }}</template></li>
        </ul>
        <MVPBadge v-if="mvp" :name="fullName(mvp)" />
      </div>
    </NuxtLink>
  </WidgetFrame>
  <EmptyState v-else-if="status === 'success'" title="Nessun risultato ancora" text="Il primo tre punti è in arrivo." />
</template>

<style scoped>
.res { --glow: var(--rv-muted); display: grid; gap: 20px; padding: 24px; border-radius: var(--r-panel); text-decoration: none; color: inherit;
  background: var(--noise), radial-gradient(70% 80% at 85% 0%, color-mix(in srgb, var(--glow) 30%, transparent), transparent 70%), var(--panel-bg);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--glow) 45%, var(--rv-line)); }
.r-w { --glow: var(--rv-green); } .r-l { --glow: var(--rv-red); }
.head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.pill-r { display: inline-flex; align-items: center; height: 32px; padding: 0 14px; border-radius: var(--r-pill); background: var(--glow); color: var(--rv-black); font-size: var(--fs-sm); letter-spacing: .06em; text-transform: uppercase; }
.board { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px; }
.team { display: grid; justify-items: center; gap: 8px; text-align: center; min-width: 0; }
.nm { font-size: 18px; line-height: 1; overflow-wrap: anywhere; }
.score { display: flex; align-items: center; gap: .12em; font-size: clamp(64px, 14vw, 132px); line-height: .9; }
.bar { width: 24px; height: 6px; border-radius: 3px; background: var(--rv-muted); }
.d { display: inline-block; animation: score-reveal var(--dur-slow) var(--ease-out) both; }
.d2 { animation-delay: 120ms; }
@keyframes score-reveal { from { opacity: 0; transform: translateY(.35em); } to { opacity: 1; transform: none; } }
.foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.scorers { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
@media (min-width: 701px) { .nm { font-size: 20px; } }
@media (prefers-reduced-motion: reduce) { .d { animation: none; } }
</style>
