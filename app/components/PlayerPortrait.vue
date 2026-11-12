<script setup lang="ts">
import type { PhotoVariant } from '~/utils/photos'

const props = withDefaults(defineProps<{
  first: string; last: string; number: number | null; photoPath?: string | null; variant?: Exclude<PhotoVariant, 'thumb'>
  bare?: boolean; plain?: boolean; stage?: 'player' | 'staff'; logoFallback?: boolean
}>(), { variant: 'portrait', bare: false, plain: false, stage: 'player', logoFallback: false })

const path = computed(() => playerAsset(props.photoPath, props.variant))
const url = usePhotoUrl('player-photos', path)
const initials = computed(() => `${props.first[0] ?? ''}${props.last[0] ?? ''}`)
const loaded = ref(false)
watch(url, () => { loaded.value = false })
</script>

<template>
  <div class="portrait" :class="[`v-${variant}`, { stage: !bare, 'stage--staff': !bare && stage === 'staff' }]">
    <span v-if="!plain" class="bignum outline-text outline-text--fill" aria-hidden="true">{{ number ?? initials }}</span>
    <template v-if="!photoPath && logoFallback">
      <img class="crest" src="/brand/logo.png" alt="" width="150" height="150" aria-hidden="true">
    </template>
    <img v-if="url" :src="url" :alt="`${first} ${last}`" class="shot" decoding="async" :class="{ in: loaded }" @load="loaded = true">
  </div>
</template>

<style scoped>
.portrait { position: relative; aspect-ratio: 4 / 5; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: end center; container-type: inline-size; --stage-fade: var(--rv-surface); }
.portrait.v-hero, .portrait.v-half { aspect-ratio: auto; }
.bignum { position: absolute; right: -4%; top: 4%; font-size: 70cqw; z-index: 0; white-space: nowrap; }
.crest { position: absolute; left: 50%; top: 35%; width: 40%; translate: -50% -50%; opacity: .18; border-radius: 50%; }
.shot { position: relative; z-index: 2; width: 100%; height: 96%; object-fit: contain; object-position: bottom center; opacity: 0; transform: translateY(6%) scale(.98); filter: drop-shadow(0 18px 24px rgb(0 0 0 / .55)); transition: opacity var(--dur-slow) var(--ease-out), transform 700ms var(--ease-out); will-change: transform; }
.shot.in { opacity: 1; transform: none; }
</style>
