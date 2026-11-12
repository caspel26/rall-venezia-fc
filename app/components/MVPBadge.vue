<script setup lang="ts">
defineProps<{ name?: string }>()
</script>

<template>
  <span class="mvp"><span class="star" aria-hidden="true">★</span><span class="display">MVP</span><span v-if="name" class="n">{{ name }}</span></span>
</template>

<style scoped>
.mvp { display: inline-flex; align-items: center; gap: var(--space-2); padding: 4px var(--space-3); border: 1px solid var(--rv-gold); border-radius: var(--r-pill); color: var(--rv-gold); font-size: var(--fs-sm); }
.n { color: var(--rv-cream); font-weight: var(--fw-ui); }
.star { animation: glow 2400ms var(--ease-standard) 2; }
@keyframes glow { 50% { text-shadow: 0 0 10px var(--rv-gold); } }
@media (prefers-reduced-motion: reduce) { .star { animation: none; } }
</style>
