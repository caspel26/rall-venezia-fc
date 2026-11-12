<script setup lang="ts">
const { data, status } = useTeamRecord()
const C = 2 * Math.PI * 42
const segs = computed(() => {
  const d = data.value
  const played = d?.played ?? 0
  if (!d || !played) return []
  let offset = 0
  return [
    { key: 'w', label: 'Vinte', n: d.wins ?? 0, color: 'var(--rv-green)' },
    { key: 'd', label: 'Pareggiate', n: d.draws ?? 0, color: 'var(--rv-muted)' },
    { key: 'l', label: 'Perse', n: d.losses ?? 0, color: 'var(--rv-red)' },
  ].map((s) => {
    const len = (s.n / played) * C
    const out = { ...s, dash: `${Math.max(0, len - 3)} ${C}`, offset: -offset }
    offset += len
    return out
  })
})
const diff = computed(() => data.value?.goal_difference ?? 0)
</script>

<template>
  <WidgetFrame v-if="data || status === 'pending'" :title="`Stagione ${data?.season ?? ''}`.trim()" to="/stats" link-label="Tutte le stats" :loading="status === 'pending' && !data">
    <div v-if="data" class="rec">
      <figure class="ring">
        <svg viewBox="0 0 100 100" role="img" :aria-label="`${data.wins} vinte, ${data.draws} pareggiate, ${data.losses} perse su ${data.played}`">
          <circle cx="50" cy="50" r="42" class="track" />
          <circle v-for="s in segs" :key="s.key" cx="50" cy="50" r="42" class="seg" :style="{ stroke: s.color, strokeDasharray: s.dash, strokeDashoffset: s.offset }" />
        </svg>
        <figcaption><span class="n display tabular">{{ data.played }}</span><span class="eyebrow">partite</span></figcaption>
      </figure>
      <dl class="leg">
        <div v-for="s in segs" :key="s.key"><dt><i :style="{ background: s.color }" /> {{ s.label }}</dt><dd class="display tabular">{{ s.n }}</dd></div>
      </dl>
    </div>
    <p v-if="data" class="gd"><span class="muted">Gol</span> <strong class="tabular">{{ data.goals_for }}–{{ data.goals_against }}</strong> <span class="diff tabular" :class="{ up: diff > 0, down: diff < 0 }">{{ diff > 0 ? `+${diff}` : diff }}</span></p>
  </WidgetFrame>
</template>

<style scoped>
.rec { display: grid; grid-template-columns: 124px 1fr; gap: var(--space-5); align-items: center; }
.ring { position: relative; margin: 0; width: 124px; height: 124px; }
svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.track { fill: none; stroke: var(--rv-line); stroke-width: 9; }
.seg { fill: none; stroke-width: 9; stroke-linecap: butt; animation: draw 1.1s var(--ease-out) both; }
@keyframes draw { from { stroke-dasharray: 0 400; } }
figcaption { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.n { font-size: var(--fs-h1); line-height: 1; }
.leg { margin: 0; display: grid; gap: var(--space-2); }
.leg > div { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); border-bottom: 1px solid var(--rv-line); padding-bottom: var(--space-1); }
dt { display: flex; align-items: center; gap: var(--space-2); font-size: var(--fs-sm); color: var(--rv-muted); }
dt i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
dd { margin: 0; font-size: var(--fs-h2); line-height: 1; }
.gd { font-size: var(--fs-sm); display: flex; gap: var(--space-2); align-items: baseline; }
.diff.up { color: var(--rv-green); } .diff.down { color: var(--rv-red); }
@media (prefers-reduced-motion: reduce) { .seg { animation: none; } }
</style>
