<script setup lang="ts">
// The squad lined up on the club's stage. Players with a photo only; the middle of the row stands tallest.
const { user } = useAuth()
const { data: squad } = useSquad()
const { data: next } = useNextMatch()
const greeting = computed(() => user.value?.user_metadata?.display_name?.split(' ')[0] ?? '')
const chip = computed(() => {
  const m = next.value?.match
  if (m && new Date(m.kickoff_at).getTime() - Date.now() < 7 * 86_400_000) return `Matchday · ${formatShortDay(m.kickoff_at)}`
  return 'Clubhouse'
})

const row = computed(() => {
  const list = (squad.value ?? []).filter((p) => p.photo_path)
  // spread the numbers so neighbours differ in height: middle first, then alternate outwards
  const out: typeof list = []
  list.forEach((p, i) => (i % 2 ? out.unshift(p) : out.push(p)))
  return out
})

const hero = ref<HTMLElement | null>(null)
let frame = 0
function move(e: PointerEvent) {
  if (!hero.value || e.pointerType !== 'mouse') return
  const el = hero.value
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    el.style.setProperty('--px', String((x - 0.5) * 2))
    el.style.setProperty('--sx', `${x * 100}%`)
    el.style.setProperty('--sy', `${((e.clientY - r.top) / r.height) * 100}%`)
  })
}
function leave() {
  hero.value?.style.setProperty('--px', '0')
  hero.value?.style.setProperty('--sx', '50%')
  hero.value?.style.setProperty('--sy', '35%')
}
</script>

<template>
  <section ref="hero" class="home-hero stage" aria-label="La squadra" @pointermove="move" @pointerleave="leave">
    <span class="stage-aurora" aria-hidden="true" />
    <p class="mark outline-text display" aria-hidden="true">Rall Venezia</p>
    <img class="crest" src="/brand/logo.png" alt="" width="150" height="150" aria-hidden="true">
    <div class="copy">
      <span class="chip-i glass intro"><AppIcon name="calendar" :size="14" />{{ chip }}</span>
      <h1 class="display intro d1">Ciao{{ greeting ? ` ${greeting}` : '' }}</h1>
    </div>
    <span class="spot" aria-hidden="true" />
    <span class="floor" aria-hidden="true" />
    <div class="squad" :style="{ '--n': row.length }">
      <div v-for="(p, i) in row" :key="p.id" class="p" :style="{ '--d': ((i % 3) + 1), '--i': i }">
        <NuxtLink :to="`/team/${p.slug}`" tabindex="-1"><span class="rise"><span class="idle"><PlayerShot :name="`${p.first_name} ${p.last_name}`" :photo-path="p.photo_path" /></span></span></NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-hero { --stage-fade: var(--rv-black); --ring-size: 760px; --ring-top: -120px; --px: 0; --sx: 50%; --sy: 35%; height: 340px; margin: calc(var(--space-6) * -1) calc(var(--gutter) * -1) var(--space-5); border-radius: 0; }
.mark { position: absolute; left: 50%; translate: -50% 0; bottom: 8%; font-size: clamp(96px, 18vw, 240px); z-index: 0; white-space: nowrap; -webkit-text-stroke: 1.5px rgb(253 127 16 / .18); }
.crest { position: absolute; right: 5%; top: 8%; width: 64px; height: 64px; border-radius: 50%; z-index: 1; opacity: .9; animation: float 6s ease-in-out infinite; }
.copy { position: absolute; z-index: 4; left: 24px; top: 24px; display: grid; gap: 10px; justify-items: start; }
.copy h1 { font-size: clamp(44px, 9vw, 96px); line-height: .92; text-shadow: 0 2px 20px rgb(0 0 0 / .6); }
.spot { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(34% 46% at var(--sx) var(--sy), rgb(253 127 16 / .22), transparent 70%); mix-blend-mode: screen; transition: background-position 200ms; }
.floor { position: absolute; left: 10%; right: 10%; bottom: -30px; height: 80px; z-index: 1; background: radial-gradient(50% 50% at 50% 50%, rgb(0 0 0 / .7), transparent); }
.squad { position: absolute; z-index: 2; left: 0; right: 0; bottom: 0; height: 70%; display: flex; justify-content: center; align-items: flex-end; }
.p { height: 100%; margin-left: -5%; transform: translateX(calc(var(--px) * var(--d) * 7px)); transition: transform 300ms var(--ease-out), opacity 300ms var(--ease-standard), filter 300ms var(--ease-standard); }
.p:first-child { margin-left: 0; }
.p :deep(a) { display: block; height: 100%; }
.rise, .idle { display: block; height: 100%; }
/* each player rises into place in turn, then breathes at their own pace */
.rise { animation: rise 900ms var(--ease-out) both; animation-delay: calc(var(--i) * 110ms + 250ms); transform-origin: bottom center; }
.idle { animation: breathe 5.5s ease-in-out infinite; animation-delay: calc(var(--i) * -0.9s); transform-origin: bottom center; }
@keyframes rise { from { opacity: 0; transform: translateY(38px) scale(.94); } to { opacity: 1; transform: none; } }
@keyframes breathe { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-5px) scale(1.012); } }
.p:nth-child(odd) { height: 94%; }
.p:nth-child(4) { height: 100%; z-index: 3; }
@media (hover: hover) {
  .squad:hover .p:not(:hover) { opacity: .7; }
  .p:hover { transform: translate(calc(var(--px) * var(--d) * 7px), -10px); filter: brightness(1.1); z-index: 5; }
  .p:hover .idle { animation-play-state: paused; }
}
/* below desktop the whole squad is laid out across the width, overlapping like a team photo, so nobody is cut off */
@media (max-width: 1050px) {
  .squad { --slot: calc(100% / (var(--n) + 1.1)); display: block; }
  .p { position: absolute; bottom: 0; left: calc(var(--i) * var(--slot)); width: calc(var(--slot) * 2.1); margin: 0 !important; }
  .p :deep(a), .p :deep(.rise), .p :deep(.idle) { height: 100%; display: block; }
  .p :deep(.pshot) { width: 100%; height: 100%; object-fit: contain; object-position: bottom center; }
}
@media (min-width: 701px) {
  .home-hero { height: 420px; margin: 0 0 var(--space-5); border-radius: var(--r-panel); }
  .crest { width: 96px; height: 96px; }
  .copy { left: 40px; top: 40px; }
}
@media (min-width: 1051px) { .home-hero { height: 480px; } }
@media (prefers-reduced-motion: reduce) { .crest, .rise, .idle { animation: none; } .spot { display: none; } }
</style>
