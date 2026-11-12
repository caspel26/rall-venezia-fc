<script setup lang="ts">
import type { IconName } from '~/components/AppIcon.vue'
import type { ResultLetter } from '~/utils/results'

// A scrolling club ticker: next match, last result, the scoring leader, the form.
const { data: next } = useNextMatch()
const { data: recent } = useRecentMatches()
const goals = useRanking('goals', 1)
const { data: league } = useStandings()
const form = computed(() => formOf([...(recent.value ?? [])].reverse()))

interface Item { icon: IconName; label: string; value: string; score?: string; form?: ResultLetter[] }
const items = computed(() => {
  const out: Item[] = []
  const n = next.value?.match
  if (n) out.push({ icon: 'calendar', label: 'Prossima', value: `Rall Venezia vs ${n.opponent?.name} · ${formatShortDay(n.kickoff_at)} ${formatTime(n.kickoff_at)}` })
  const l = recent.value?.[0]
  if (l) out.push({ icon: 'whistle', label: 'Ultima', value: `Rall Venezia vs ${l.opponent?.name}`, score: `${l.rv_score}–${l.opp_score}` })
  const top = goals.rows.value[0]
  if (top) out.push({ icon: 'ball', label: 'Capocannoniere', value: `${fullName(top.player)} · ${top.value} gol` })
  if (league.value?.us) out.push({ icon: 'trophy', label: 'Classifica', value: `${league.value.us.position}° · ${league.value.us.points} punti` })
  if (form.value.length) out.push({ icon: 'form', label: 'Forma', value: '', form: form.value })
  return out
})
</script>

<template>
  <div v-if="items.length" class="ticker" role="marquee" aria-label="Ultime dal club">
    <span class="tag"><img src="/brand/logo.png" alt="" width="20" height="20" aria-hidden="true"><span class="display">Rall</span></span>
    <div class="viewport">
      <div class="track">
        <ul v-for="n in 2" :key="n" class="set" :aria-hidden="n === 2">
          <li v-for="t in items" :key="t.label"><AppIcon :name="t.icon" :size="16" /><span class="lb">{{ t.label }}</span>
            <span v-if="t.value" class="vl">{{ t.value }}</span>
            <span v-if="t.score" class="sc display">{{ t.score }}</span>
            <span v-if="t.form" class="pills"><ResultPill v-for="(r, i) in t.form" :key="i" :result="r" class="mini" /></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker { display: flex; align-items: stretch; height: 40px; background: var(--rv-surface); border-bottom: 1px solid var(--rv-line); overflow: hidden; }
.tag { display: inline-flex; align-items: center; gap: 8px; padding: 0 22px 0 14px; background: var(--rv-orange); color: var(--rv-orange-ink); clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%); z-index: 2; flex: none; }
.tag img { border-radius: 50%; }
.tag .display { font-size: 16px; }
.viewport { flex: 1; min-width: 0; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 32px, #000 calc(100% - 32px), transparent); mask-image: linear-gradient(90deg, transparent, #000 32px, #000 calc(100% - 32px), transparent); }
.track { display: flex; width: max-content; animation: marquee 44s linear infinite; height: 100%; }
.ticker:hover .track, .ticker:focus-within .track { animation-play-state: paused; }
.set { display: flex; margin: 0; padding: 0; list-style: none; }
.set li { display: flex; align-items: center; gap: 8px; white-space: nowrap; padding: 0 28px; height: 40px; position: relative; }
.set li::after { content: ''; position: absolute; right: 0; width: 4px; height: 4px; border-radius: 50%; background: var(--rv-line-strong); }
.set li > svg { color: var(--rv-orange); }
.lb { font: 700 12px/1 var(--font-ui); letter-spacing: .1em; text-transform: uppercase; color: var(--rv-orange); }
.vl { font: 600 14px/1 var(--font-ui); color: var(--rv-cream); }
.sc { font-size: 16px; color: var(--rv-cream); }
.pills { display: inline-flex; gap: 4px; }
.pills :deep(.pill) { width: 18px; height: 18px; font-size: 11px; }
@media (prefers-reduced-motion: reduce) { .track { animation: none; width: auto; overflow-x: auto; } .set:last-child { display: none; } }
</style>
