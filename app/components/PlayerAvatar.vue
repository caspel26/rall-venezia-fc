<script setup lang="ts">
import type { IconName } from '~/components/AppIcon.vue'

type Status = 'available' | 'maybe' | 'unavailable' | 'none'
const props = withDefaults(defineProps<{
  first: string; last: string; photoPath?: string | null; size?: 36 | 40 | 48 | 56 | 64 | 72
  status?: Status; ring?: 'orange' | 'gold' | 'none'
}>(), { size: 48, ring: 'none' })

// face-centred square asset (built from the head position, see scripts/build-player-assets.sh)
const url = usePhotoUrl('player-photos', computed(() => playerAsset(props.photoPath, 'thumb')))
const initials = computed(() => `${props.first[0] ?? ''}${props.last[0] ?? ''}`)
const loaded = ref(false)
watch(url, () => { loaded.value = false })

const ringVar = computed(() => ({ available: 'var(--rv-green)', maybe: 'var(--rv-amber)', unavailable: 'var(--rv-red)' } as Record<string, string>)[props.status ?? ''] ?? (props.ring === 'gold' ? 'var(--rv-gold)' : props.ring === 'orange' ? 'var(--rv-orange)' : 'transparent'))
const badge = computed<IconName | null>(() => ({ available: 'check', maybe: 'question', unavailable: 'x' } as Record<string, IconName>)[props.status ?? ''] ?? null)
const dimmed = computed(() => props.status === 'none')
</script>

<template>
  <span class="av" :class="{ dimmed, ringed: ringVar !== 'transparent' }" :style="{ '--s': `${size}px`, '--ring-c': ringVar }">
    <span class="face">
      <span v-if="!url || !loaded" class="ini display" aria-hidden="true">{{ initials }}</span>
      <img v-if="url" :src="url" :alt="`${first} ${last}`" decoding="async" :class="{ in: loaded }" @load="loaded = true">
    </span>
    <span v-if="badge" :key="status" class="badge" :style="{ background: ringVar }"><AppIcon :name="badge" :size="12" /></span>
  </span>
</template>

<style scoped>
.av { position: relative; display: inline-block; width: var(--s); height: var(--s); flex: none; border-radius: 50%; transition: box-shadow 200ms var(--ease-standard), translate 240ms var(--ease-spring), scale 240ms var(--ease-spring); }
.av.ringed { box-shadow: 0 0 0 2px var(--rv-black), 0 0 0 4px var(--ring-c); }
.av.dimmed { outline: 2px dashed var(--rv-line-strong); outline-offset: 2px; }
.face { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; display: grid; place-items: center;
  background: radial-gradient(70% 70% at 50% 30%, rgb(253 127 16 / .28), transparent 70%), #15170f; }
.face img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 12%; transform: scale(1.18); transform-origin: 50% 22%; opacity: 0; transition: opacity var(--dur-slow) var(--ease-out); }
.face img.in { opacity: 1; }
.dimmed .face img { filter: grayscale(1); }
.dimmed.av { opacity: .6; }
.ini { font-size: calc(var(--s) * .4); color: var(--rv-muted); }
.badge { position: absolute; right: -2px; bottom: -2px; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; color: var(--rv-black); border: 2px solid var(--rv-black); animation: pop 280ms var(--ease-spring) both; }
@keyframes pop { from { scale: .6; } }
@media (hover: hover) { a:hover > .av, button:hover > .av { translate: 0 -2px; scale: 1.06; } }
@media (prefers-reduced-motion: reduce) { .badge { animation: none; } }
</style>
