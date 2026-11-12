<script setup lang="ts">
const props = defineProps<{ first: string; last: string; number: number | null; photoPath?: string | null; bucket?: string }>()
const url = usePhotoUrl(props.bucket ?? 'player-photos', toRef(props, 'photoPath'))
const initials = computed(() => `${props.first[0] ?? ''}${props.last[0] ?? ''}`)
</script>

<template>
  <div class="portrait">
    <img v-if="url" :src="url" :alt="`${first} ${last}`" loading="lazy" width="400" height="500">
    <template v-else>
      <span class="num display tabular" aria-hidden="true">{{ number ?? initials }}</span>
    </template>
  </div>
</template>

<style scoped>
.portrait { position: relative; aspect-ratio: 4 / 5; overflow: hidden; background: linear-gradient(160deg, var(--rv-surface-2), var(--rv-black)); display: grid; place-items: center; }
.portrait img { width: 100%; height: 100%; object-fit: cover; }
.num { font-size: clamp(96px, 28vw, 200px); color: var(--rv-line); }
</style>
