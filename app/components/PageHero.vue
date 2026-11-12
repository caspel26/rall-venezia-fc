<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; lead?: string }>()
</script>

<template>
  <header class="hero">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <h1 class="display">{{ title }}</h1>
    <p v-if="lead" class="muted">{{ lead }}</p>
    <slot />
  </header>
</template>

<style scoped>
.hero { display: grid; gap: var(--space-2); padding-bottom: var(--space-5); }
h1 { font-size: var(--fs-display); }
</style>
