<script setup lang="ts">
import type { PhotoVariant } from '~/utils/photos'

const props = withDefaults(defineProps<{
  first: string; last: string; number: number | null; photoPath?: string | null; variant?: PhotoVariant; bare?: boolean; plain?: boolean
}>(), { variant: 'portrait', bare: false, plain: false })

const path = computed(() => playerAsset(props.photoPath, props.variant))
const url = usePhotoUrl('player-photos', path)
const initials = computed(() => `${props.first[0] ?? ''}${props.last[0] ?? ''}`)
const loaded = ref(false)
watch(url, () => { loaded.value = false })
</script>

<template>
  <div class="portrait" :class="[`v-${variant}`, { stage: !bare }]">
    <span v-if="variant !== 'thumb' && !plain" class="bignum outline-text" aria-hidden="true">{{ number ?? initials }}</span>
    <span v-else-if="!url || !loaded" class="ini display" aria-hidden="true">{{ initials }}</span>
    <img v-if="url" :src="url" :alt="`${first} ${last}`" class="shot" decoding="async" :class="{ in: loaded }" @load="loaded = true">
  </div>
</template>

<style scoped>
.portrait { position: relative; aspect-ratio: 3 / 4; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: end center; container-type: inline-size; --stage-fade: var(--rv-surface); }
.portrait.v-thumb { aspect-ratio: 1; place-items: center; border-radius: var(--r-pill); }
.portrait.v-thumb::after { display: none; }
.portrait.v-hero { aspect-ratio: auto; }
.bignum { position: absolute; left: 50%; top: 6%; transform: translateX(-50%); font-size: clamp(110px, 62cqw, 360px); z-index: 0; white-space: nowrap; }
.ini { position: absolute; font-size: 38%; font-size: 40cqw; color: var(--rv-muted); }
.shot { position: relative; z-index: 2; width: 100%; height: 100%; object-fit: contain; object-position: bottom center; opacity: 0; transform: translateY(6%) scale(.98); transition: opacity var(--dur-slow) var(--ease-out), transform 700ms var(--ease-out); will-change: transform; }
.shot.in { opacity: 1; transform: none; }
.v-thumb .shot { object-fit: cover; object-position: top center; }
</style>
