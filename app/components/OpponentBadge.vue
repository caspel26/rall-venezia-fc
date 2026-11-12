<script setup lang="ts">
const props = withDefaults(defineProps<{ name: string; short?: string | null; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
const initials = computed(() => (props.short || props.name).slice(0, 3).toUpperCase())
</script>

<template>
  <span class="badge display" :class="size" role="img" :aria-label="name">{{ initials }}</span>
</template>

<style scoped>
.badge { display: inline-grid; place-items: center; border-radius: var(--r-pill); background: radial-gradient(70% 70% at 50% 30%, rgb(255 255 255 / .1), transparent 70%), var(--rv-surface-3); box-shadow: inset 0 0 0 1px var(--rv-line-strong); color: var(--rv-cream); flex: none; }
.sm { width: 40px; height: 40px; font-size: var(--fs-sm); }
.md { width: 72px; height: 72px; font-size: var(--fs-h3); }
.lg { width: 96px; height: 96px; font-size: var(--fs-h2); }
@media (max-width: 700px) { .md { width: 56px; height: 56px; } .lg { width: 72px; height: 72px; } }
</style>
