<script setup lang="ts">
defineProps<{ rv: number | null; opp: number | null; isHome: boolean; opponent: string }>()
</script>

<template>
  <div class="board" :class="{ away: !isHome }">
    <p class="team display">Rall Venezia</p>
    <p class="score display tabular" :aria-label="`${rv ?? '–'} a ${opp ?? '–'}`">
      <span class="d d1">{{ formatScore(rv) }}</span><span class="dash">—</span><span class="d d2">{{ formatScore(opp) }}</span>
    </p>
    <p class="team display">{{ opponent }}</p>
  </div>
</template>

<style scoped>
.board { display: grid; gap: var(--space-2); justify-items: start; }
.team { font-size: var(--fs-h2); }
.score { font-size: var(--fs-score); display: flex; align-items: baseline; gap: .12em; }
.dash { color: var(--rv-muted); }
.d { display: inline-block; animation: score-reveal var(--dur-slow) var(--ease-out) both; }
.d2 { animation-delay: 120ms; }
@keyframes score-reveal { from { opacity: 0; transform: translateY(.35em); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .d { animation: none; } }
</style>
