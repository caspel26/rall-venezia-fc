<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; lead?: string }>()
</script>

<template>
  <header class="hero">
    <p v-if="eyebrow" class="eyebrow intro">{{ eyebrow }}</p>
    <h1 class="display intro d1">{{ title }}</h1>
    <p v-if="lead" class="muted intro d2">{{ lead }}</p>
    <slot />
  </header>
</template>

<style scoped>
.hero { display: grid; gap: var(--space-2); padding-bottom: var(--space-5); }
h1 { font-size: var(--fs-display); }
</style>
