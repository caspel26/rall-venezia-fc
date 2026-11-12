<script setup lang="ts">
import type { PhotoVariant } from '~/utils/photos'

const props = withDefaults(defineProps<{
  first: string; last: string; number: number | null; photoPath?: string | null; variant?: PhotoVariant
}>(), { variant: 'portrait' })

const path = computed(() => playerAsset(props.photoPath, props.variant))
const url = usePhotoUrl('player-photos', path)
const initials = computed(() => `${props.first[0] ?? ''}${props.last[0] ?? ''}`)
const loaded = ref(false)
watch(url, () => { loaded.value = false })
</script>

<template>
  <div class="portrait" :class="variant">
    <img v-if="url" :src="url" :alt="`${first} ${last}`" decoding="async" :class="{ in: loaded }" @load="loaded = true">
    <span v-if="!url || !loaded" class="num display tabular" aria-hidden="true">{{ number ?? initials }}</span>
  </div>
</template>

<style scoped>
.portrait { position: relative; aspect-ratio: 3 / 4; overflow: hidden; background: linear-gradient(160deg, var(--rv-surface-2), var(--rv-black)); display: grid; place-items: center; }
.portrait.thumb { aspect-ratio: 1; }
.portrait img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top; opacity: 0; transition: opacity var(--dur-slow) var(--ease-out); }
.portrait img.in { opacity: 1; }
.num { font-size: clamp(96px, 28vw, 200px); color: var(--rv-line); }
.thumb .num { font-size: 40px; }
</style>
