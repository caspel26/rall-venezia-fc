<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' | 'hero' }>(), { size: 'md' })
</script>

<template>
  <div class="skeleton" :class="size" aria-hidden="true" />
</template>

<style scoped>
.skeleton {
  border-radius: var(--r-card); background: linear-gradient(90deg, var(--rv-surface) 0%, var(--rv-surface-2) 50%, var(--rv-surface) 100%);
  background-size: 200% 100%; animation: shimmer 1400ms linear infinite;
}
.sm { height: 48px; } .md { height: 96px; } .lg { height: 160px; } .hero { height: 280px; }
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
</style>
