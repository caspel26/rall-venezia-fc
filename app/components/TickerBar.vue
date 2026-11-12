<script setup lang="ts">
// A scrolling club ticker: next match, last result, the scoring leader, the form.
const { data: next } = useNextMatch()
const { data: recent } = useRecentMatches()
const goals = useRanking('goals', 1)
const form = computed(() => formOf([...(recent.value ?? [])].reverse()))

const items = computed(() => {
  const out: string[] = []
  const n = next.value?.match
  if (n) out.push(`Prossima · Rall Venezia vs ${n.opponent?.name} · ${formatShortDay(n.kickoff_at)} ${formatTime(n.kickoff_at)}`)
  const l = recent.value?.[0]
  if (l) out.push(`Ultima · Rall Venezia ${l.rv_score}–${l.opp_score} ${l.opponent?.name}`)
  const top = goals.rows.value[0]
  if (top) out.push(`Capocannoniere · ${fullName(top.player)} ${top.value} gol`)
  if (form.value.length) out.push(`Forma · ${form.value.map((r) => RESULT_LABEL[r].letter).join(' ')}`)
  return out
})
</script>

<template>
  <div v-if="items.length" class="ticker" role="marquee" aria-label="Ultime dal club">
    <div class="track">
      <ul v-for="n in 2" :key="n" class="set" :aria-hidden="n === 2">
        <li v-for="t in items" :key="t"><span class="dot" aria-hidden="true">●</span>{{ t }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.ticker { overflow: hidden; background: var(--rv-orange); color: var(--rv-orange-ink); border-block: 1px solid rgb(0 0 0 / .25); }
.track { display: flex; width: max-content; animation: marquee 48s linear infinite; }
.ticker:hover .track { animation-play-state: paused; }
.set { display: flex; margin: 0; padding: 0; list-style: none; }
.set li { white-space: nowrap; padding: 0 var(--space-6); font: 700 var(--fs-sm)/38px var(--font-ui); letter-spacing: .08em; text-transform: uppercase; }
.dot { margin-right: var(--space-3); font-size: 8px; vertical-align: middle; }
@media (prefers-reduced-motion: reduce) { .track { animation: none; width: auto; overflow-x: auto; } .set:last-child { display: none; } }
</style>
