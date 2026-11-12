<script setup lang="ts">
const { data, status } = useTeamRecord()
const C = 2 * Math.PI * 42
const GAP = 4
const segs = computed(() => {
  const d = data.value
  const played = d?.played ?? 0
  if (!d || !played) return []
  let offset = 0
  return [
    { key: 'w', label: 'Vinte', n: d.wins ?? 0, color: 'var(--rv-green)' },
    { key: 'd', label: 'Pareggiate', n: d.draws ?? 0, color: 'var(--rv-muted)' },
    { key: 'l', label: 'Perse', n: d.losses ?? 0, color: 'var(--rv-red)' },
  ].map((s, i) => {
    const len = (s.n / played) * C
    const out = { ...s, dash: `${Math.max(0, len - GAP)} ${C}`, offset: -offset, delay: i * 120 }
    offset += len
    return out
  })
})
const diff = computed(() => data.value?.goal_difference ?? 0)
</script>

<template>
  <WidgetFrame v-if="data || status === 'pending'" :title="`Stagione ${data?.season ?? ''}`.trim()" icon="chart" to="/stats" link-label="Tutte le stats" :loading="status === 'pending' && !data">
    <div v-if="data" class="rec">
      <figure class="ring">
        <svg viewBox="0 0 100 100" role="img" :aria-label="`${data.wins} vinte, ${data.draws} pareggiate, ${data.losses} perse su ${data.played}`">
          <circle cx="50" cy="50" r="42" class="track" />
          <circle v-for="s in segs" :key="s.key" cx="50" cy="50" r="42" class="seg" :style="{ stroke: s.color, strokeDasharray: s.dash, strokeDashoffset: s.offset, animationDelay: `${s.delay}ms` }" />
        </svg>
        <figcaption><span class="n display tabular">{{ data.played }}</span><span class="eyebrow">partite</span></figcaption>
      </figure>
      <dl class="leg">
        <div v-for="s in segs" :key="s.key" :style="{ borderTopColor: s.color }"><dd class="display tabular">{{ s.n }}</dd><dt>{{ s.label }}</dt></div>
      </dl>
    </div>
    <p v-if="data" class="gd"><span class="muted">Gol {{ data.goals_for }}–{{ data.goals_against }}</span> <span class="diff tabular" :class="{ up: diff > 0, down: diff < 0 }">{{ diff > 0 ? `+${diff}` : diff }}</span></p>
  </WidgetFrame>
</template>

<style scoped>
.rec { display: grid; gap: 20px; justify-items: center; }
.ring { position: relative; margin: 0; width: 112px; height: 112px; }
svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.track { fill: none; stroke: var(--rv-surface-3); stroke-width: 10; }
.seg { fill: none; stroke-width: 10; stroke-linecap: round; animation: draw 1.1s var(--ease-out) both; }
@keyframes draw { from { stroke-dasharray: 0 400; } }
figcaption { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.n { font-size: 40px; line-height: 1; }
.leg { margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; }
.leg > div { display: grid; justify-items: center; padding: 10px 4px; border-top: 4px solid; background: var(--rv-surface-2); border-radius: 0 0 12px 12px; }
dd { margin: 0; font-size: 32px; line-height: 1; }
dt { font-size: var(--fs-cap); color: var(--rv-muted); }
.gd { display: flex; justify-content: center; gap: 10px; align-items: center; font-size: var(--fs-sm); }
.diff { padding: 2px 10px; border-radius: var(--r-pill); font-weight: var(--fw-head); background: var(--rv-surface-3); }
.diff.up { background: color-mix(in srgb, var(--rv-green) 20%, transparent); color: var(--rv-green); }
.diff.down { background: color-mix(in srgb, var(--rv-red) 20%, transparent); color: var(--rv-red); }
@media (min-width: 701px) { .ring { width: 132px; height: 132px; } }
@media (prefers-reduced-motion: reduce) { .seg { animation: none; } }
</style>
