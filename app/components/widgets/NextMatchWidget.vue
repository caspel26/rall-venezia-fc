<script setup lang="ts">
const { data, status } = useNextMatch()
const cd = useCountdown(() => data.value?.match.kickoff_at)
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <WidgetFrame title="Prossima partita" bare :loading="status === 'pending' && data === undefined">
    <NuxtLink v-if="data" :to="`/matches/${data.match.id}`" class="poster stage">
      <img class="wm" src="/brand/logo.png" alt="" width="150" height="150" aria-hidden="true">
      <div class="top">
        <p class="eyebrow"><span v-if="cd.soon" class="live-dot" aria-hidden="true" /> {{ cd.soon ? 'Oggi si gioca' : 'Prossima partita' }}<template v-if="data.match.competition"> · {{ data.match.competition.name }}</template></p>
        <p class="vs display">
          <span>Rall Venezia</span>
          <span class="x">vs</span>
          <span class="opp">{{ data.match.opponent?.name }}</span>
        </p>
      </div>
      <div class="bottom">
        <div class="when">
          <p class="day">{{ formatDay(data.match.kickoff_at) }}</p>
          <p class="time display tabular">{{ formatTime(data.match.kickoff_at) }}</p>
          <p v-if="data.match.venue" class="muted venue">{{ data.match.venue }} · {{ data.match.is_home ? 'in casa' : 'in trasferta' }}</p>
        </div>
        <dl v-if="!cd.over" class="cd" aria-label="Tempo al calcio d'inizio">
          <div><dd class="display tabular">{{ cd.d }}</dd><dt>giorni</dt></div>
          <div><dd class="display tabular">{{ pad(cd.h) }}</dd><dt>ore</dt></div>
          <div><dd class="display tabular">{{ pad(cd.m) }}</dd><dt>min</dt></div>
          <div><dd class="display tabular sec">{{ pad(cd.s) }}</dd><dt>sec</dt></div>
        </dl>
      </div>
      <span class="shine" aria-hidden="true" />
    </NuxtLink>
    <EmptyState v-else title="Nessuna partita in programma" text="Per una volta possiamo riposare." />
  </WidgetFrame>
</template>

<style scoped>
.poster { --stage-fade: transparent; display: grid; gap: var(--space-5); padding: var(--space-6) var(--space-5); border-radius: var(--r-s); border: 1px solid var(--rv-line); border-left: 4px solid var(--rv-orange); text-decoration: none; color: inherit; min-height: 300px; align-content: space-between; transition: border-color var(--dur) var(--ease-standard); }
.poster::after { display: none; }
.wm { position: absolute; right: -50px; bottom: -60px; width: 300px; height: 300px; opacity: .1; z-index: -1; border-radius: 50%; animation: float 9s ease-in-out infinite; }
.top, .bottom { display: grid; gap: var(--space-3); }
.vs { display: grid; gap: 2px; font-size: clamp(44px, 8vw, 92px); line-height: .9; }
.x { color: var(--rv-orange); font-size: .45em; }
.opp { color: var(--rv-cream); }
.day { font-size: var(--fs-h3); text-transform: capitalize; }
.time { font-size: var(--fs-h1); color: var(--rv-orange); line-height: 1; }
.venue { font-size: var(--fs-sm); }
.bottom { align-items: end; }
.cd { display: flex; gap: var(--space-2); margin: 0; }
.cd > div { display: grid; justify-items: center; min-width: 58px; padding: var(--space-2) var(--space-3); background: rgb(11 11 9 / .7); border: 1px solid var(--rv-line); border-radius: var(--r-s); }
.cd dd { margin: 0; font-size: var(--fs-h1); line-height: 1; }
.cd dt { font-size: var(--fs-cap); letter-spacing: .12em; text-transform: uppercase; color: var(--rv-muted); }
.sec { color: var(--rv-orange); }
.shine { position: absolute; inset: 0; z-index: 2; pointer-events: none; background: linear-gradient(100deg, transparent 40%, rgb(255 255 255 / .07) 50%, transparent 60%); transform: translateX(-120%); }
@media (hover: hover) { .poster:hover { border-color: var(--rv-orange); } .poster:hover .shine { animation: sweep 1.1s var(--ease-out); } }
@media (min-width: 701px) { .bottom { grid-template-columns: 1fr auto; } }
@media (prefers-reduced-motion: reduce) { .wm { animation: none; } }
</style>
