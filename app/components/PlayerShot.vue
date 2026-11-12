<script setup lang="ts">
import type { PhotoVariant } from '~/utils/photos'
const props = withDefaults(defineProps<{ name: string; photoPath?: string | null; variant?: PhotoVariant }>(), { variant: 'hero' })
const url = usePhotoUrl('player-photos', computed(() => playerAsset(props.photoPath, props.variant)))
const loaded = ref(false)
watch(url, () => { loaded.value = false })
</script>

<template>
  <img v-if="url" :src="url" :alt="name" class="pshot" :class="{ in: loaded }" decoding="async" @load="loaded = true">
</template>

<style scoped>
.pshot { height: 100%; width: auto; max-width: none; object-fit: contain; opacity: 0; transform: translateY(8%); transition: opacity 600ms var(--ease-out), transform 800ms var(--ease-out); filter: drop-shadow(0 10px 18px rgb(0 0 0 / .55)); }
.pshot.in { opacity: 1; transform: none; }
</style>
