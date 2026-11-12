<script setup lang="ts">
const props = defineProps<{ path?: string | null; alt?: string }>()
const url = usePhotoUrl('graphics', toRef(props, 'path'))
</script>

<template>
  <div v-if="path" class="cover">
    <img v-if="url" :src="url" :alt="alt ?? ''" loading="lazy" decoding="async">
  </div>
</template>

<style scoped>
.cover { aspect-ratio: 16 / 10; background: #d9cfba; overflow: hidden; }
.cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
