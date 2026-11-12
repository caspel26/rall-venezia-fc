<script setup lang="ts">
const props = withDefaults(defineProps<{ name: string; short?: string | null; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
const initials = computed(() => (props.short || props.name).slice(0, 3).toUpperCase())
</script>

<template>
  <span class="badge display" :class="size" role="img" :aria-label="name">{{ initials }}</span>
</template>

<style scoped>
.badge { display: inline-grid; place-items: center; border-radius: var(--r-pill); border: 2px solid var(--rv-line); background: var(--rv-surface-2); color: var(--rv-cream); }
.sm { width: 32px; height: 32px; font-size: var(--fs-cap); }
.md { width: 56px; height: 56px; font-size: var(--fs-h3); }
.lg { width: 96px; height: 96px; font-size: var(--fs-h2); }
</style>
