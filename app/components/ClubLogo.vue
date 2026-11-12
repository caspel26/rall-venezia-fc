<script setup lang="ts">
// Placeholder crest until the winged-lion artwork is supplied.
withDefaults(defineProps<{ size?: number }>(), { size: 96 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 96 96" role="img" aria-label="Rall Venezia FC" class="logo">
    <path d="M48 6 84 18v30c0 22-14 34-36 42C26 82 12 70 12 48V18L48 6Z" fill="none" stroke="currentColor" stroke-width="3" />
    <path d="M10 30c10-2 16 2 22 10M86 30c-10-2-16 2-22 10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    <text x="48" y="62" text-anchor="middle" class="mono" fill="currentColor">RV</text>
  </svg>
</template>

<style scoped>
.logo { color: var(--rv-orange); }
.mono { font-family: var(--font-display); font-size: 34px; }
</style>
