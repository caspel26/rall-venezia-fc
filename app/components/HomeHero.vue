<script setup lang="ts">
// The squad lined up on the club's stage. Players with a photo only; the middle of the row stands tallest.
const { user } = useAuth()
const { data: squad } = useSquad()
const greeting = computed(() => user.value?.user_metadata?.display_name?.split(' ')[0] ?? '')

const row = computed(() => {
  const list = (squad.value ?? []).filter((p) => p.photo_path)
  // spread the numbers so neighbours differ in height: middle first, then alternate outwards
  const out: typeof list = []
  list.forEach((p, i) => (i % 2 ? out.unshift(p) : out.push(p)))
  return out
})

const hero = ref<HTMLElement | null>(null)
function move(e: PointerEvent) {
  if (!hero.value || e.pointerType !== 'mouse') return
  const r = hero.value.getBoundingClientRect()
  hero.value.style.setProperty('--px', String(((e.clientX - r.left) / r.width - 0.5) * 2))
}
function leave() { hero.value?.style.setProperty('--px', '0') }
</script>

<template>
  <section ref="hero" class="home-hero stage" aria-label="La squadra" @pointermove="move" @pointerleave="leave">
    <p class="mark outline-text display" aria-hidden="true">Rall<br>Venezia</p>
    <img class="crest" src="/brand/logo.png" alt="" width="150" height="150" aria-hidden="true">
    <div class="copy">
      <p class="eyebrow intro">Matchday</p>
      <h1 class="display intro d1">Ciao{{ greeting ? ` ${greeting}` : '' }}</h1>
    </div>
    <div class="squad" aria-hidden="false">
      <div v-for="(p, i) in row" :key="p.id" class="p" :style="{ '--d': ((i % 3) + 1), '--i': i }">
        <NuxtLink :to="`/team/${p.slug}`" tabindex="-1"><PlayerShot :name="`${p.first_name} ${p.last_name}`" :photo-path="p.photo_path" /></NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-hero { --stage-fade: var(--rv-black); --px: 0; height: 300px; border-radius: var(--r-s); margin-bottom: var(--space-5); border: 1px solid var(--rv-line); }
.mark { position: absolute; left: 4%; bottom: 6%; font-size: clamp(64px, 17vw, 190px); z-index: 0; -webkit-text-stroke: 2px rgb(253 127 16 / .38); }
.crest { position: absolute; right: 5%; top: 8%; width: 76px; height: 76px; border-radius: 50%; z-index: 1; opacity: .9; animation: float 6s ease-in-out infinite; }
.copy { position: absolute; z-index: 4; left: var(--space-5); top: var(--space-5); display: grid; gap: var(--space-1); }
.copy h1 { font-size: clamp(40px, 9vw, 84px); line-height: .92; text-shadow: 0 2px 20px rgb(0 0 0 / .6); }
.squad { position: absolute; z-index: 2; left: 0; right: 0; bottom: 0; height: 76%; display: flex; justify-content: center; align-items: flex-end; }
.p { height: 100%; margin-left: -5%; transform: translateX(calc(var(--px) * var(--d) * 7px)); transition: transform 300ms var(--ease-out); }
.p:first-child { margin-left: 0; }
.p :deep(a) { display: block; height: 100%; }
.p:nth-child(odd) { height: 94%; }
.p:nth-child(4) { height: 100%; z-index: 3; }
@media (min-width: 701px) { .home-hero { height: 400px; } .crest { width: 104px; height: 104px; } }
@media (min-width: 1051px) { .home-hero { height: 440px; } }
@media (prefers-reduced-motion: reduce) { .crest { animation: none; } }
</style>
