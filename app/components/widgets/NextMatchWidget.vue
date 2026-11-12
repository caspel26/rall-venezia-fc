<script setup lang="ts">
const { data, status } = useNextMatch()
const cd = useCountdown(() => data.value?.match.kickoff_at)
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <WidgetFrame title="Prossima partita" icon="calendar" bare :loading="status === 'pending' && data === undefined">
    <NuxtLink v-if="data" v-tilt :to="`/matches/${data.match.id}`" class="poster stage person-card">
      <div class="chips">
        <span v-if="data.match.competition" class="chip-i glass"><AppIcon name="trophy" :size="14" />{{ data.match.competition.name }}</span>
        <span class="chip-i glass"><AppIcon :name="data.match.is_home ? 'home' : 'plane'" :size="14" />{{ data.match.is_home ? 'In casa' : 'Trasferta' }}</span>
        <span v-if="cd.soon" class="chip-i live"><span class="live-dot" aria-hidden="true" />Oggi si gioca</span>
      </div>

      <div class="matchup">
        <div class="side"><ClubLogo :size="72" class="logo" /><p class="nm display">Rall Venezia</p></div>
        <span class="vs display" aria-hidden="true">vs</span>
        <div class="side"><OpponentBadge :name="data.match.opponent?.name ?? ''" :short="data.match.opponent?.short_name" size="md" /><p class="nm display">{{ data.match.opponent?.name }}</p></div>
      </div>

      <div class="bottom">
        <div class="when">
          <p class="day"><AppIcon name="calendar" :size="16" />{{ formatDay(data.match.kickoff_at) }}</p>
          <p class="time display tabular">{{ formatTime(data.match.kickoff_at) }}</p>
          <p v-if="data.match.venue" class="venue"><AppIcon name="map-pin" :size="14" />{{ data.match.venue }}</p>
        </div>
        <dl v-if="!cd.over" class="cd" aria-label="Tempo al calcio d'inizio">
          <div><dd class="display tabular">{{ cd.d }}</dd><dt>giorni</dt></div>
          <div><dd class="display tabular">{{ pad(cd.h) }}</dd><dt>ore</dt></div>
          <div><dd class="display tabular">{{ pad(cd.m) }}</dd><dt>min</dt></div>
          <div><dd class="display tabular sec"><Transition name="tick" mode="out-in"><span :key="cd.s">{{ pad(cd.s) }}</span></Transition></dd><dt>sec</dt></div>
        </dl>
      </div>
      <span class="shine" aria-hidden="true" />
    </NuxtLink>
    <EmptyState v-else title="Nessuna partita in programma" text="Per una volta possiamo riposare." />
  </WidgetFrame>
</template>

<style scoped>
.poster { --stage-fade: transparent; --ring-size: 520px; --ring-top: -160px; display: grid; gap: 24px; padding: 24px; border-radius: var(--r-panel); min-height: 380px; align-content: space-between; box-shadow: inset 0 0 0 1px var(--rv-line-strong); }
.poster::before { left: 70%; }
.poster::after { display: none; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip-i.live { background: var(--rv-orange); color: var(--rv-orange-ink); }
.chip-i.live .live-dot { background: var(--rv-orange-ink); }
.matchup { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; text-align: center; }
.side { display: grid; justify-items: center; gap: 10px; min-width: 0; }
.logo { width: 56px; height: 56px; }
.nm { font-size: 24px; line-height: 1; overflow-wrap: anywhere; }
.vs { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; box-shadow: inset 0 0 0 1px var(--rv-orange-line); color: var(--rv-orange); font-size: 18px; }
.bottom { display: grid; gap: 16px; align-items: end; }
.day { display: flex; align-items: center; gap: 8px; font-size: 16px; text-transform: capitalize; }
.time { font-size: 40px; color: var(--rv-orange); line-height: 1.1; }
.venue { display: flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--rv-muted); }
.cd { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 0; }
.cd > div { display: grid; justify-items: center; padding: 10px 6px; background: var(--rv-glass); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: inset 0 0 0 1px var(--rv-line); border-radius: 12px; }
.cd dd { margin: 0; font-size: 32px; line-height: 1; position: relative; }
.cd dt { font-size: var(--fs-cap); letter-spacing: .1em; text-transform: uppercase; color: var(--rv-muted); }
.sec { color: var(--rv-orange); }
.shine { position: absolute; inset: 0; z-index: 4; pointer-events: none; background: linear-gradient(100deg, transparent 40%, rgb(255 255 255 / .07) 50%, transparent 60%); transform: translateX(-120%); }
@media (hover: hover) { .poster:hover .shine { animation: sweep 1.1s var(--ease-out); } .poster:hover { --lift: -3px; } }
@media (min-width: 701px) {
  .poster { padding: 32px; min-height: 340px; }
  .logo { width: 72px; height: 72px; }
  .nm { font-size: 44px; }
  .bottom { grid-template-columns: 1fr auto; }
  .cd { grid-template-columns: repeat(4, 64px); }
  .cd > div { height: 72px; align-content: center; }
  .cd dd { font-size: 36px; }
}
</style>
