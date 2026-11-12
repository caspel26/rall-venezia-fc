<script setup lang="ts">
const props = withDefaults(defineProps<{ name: string; short?: string | null; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
const initials = computed(() => (props.short || props.name).slice(0, 3).toUpperCase())
const logo = useTeamLogo(() => props.name)
const broken = ref(false)
</script>

<template>
  <span class="badge display" :class="[size, { crest: logo && !broken }]" role="img" :aria-label="name">
    <img v-if="logo && !broken" :src="logo" alt="" loading="lazy" @error="broken = true">
    <template v-else>{{ initials }}</template>
  </span>
</template>

<style scoped>
.badge { display: inline-grid; place-items: center; border-radius: var(--r-pill); background: radial-gradient(70% 70% at 50% 30%, rgb(255 255 255 / .1), transparent 70%), var(--rv-surface-3); box-shadow: inset 0 0 0 1px var(--rv-line-strong); color: var(--rv-cream); flex: none; }
/* official crests sit on a light plate so dark ones (Juventus) stay readable */
.crest { background: radial-gradient(80% 80% at 50% 25%, #fff, #e9e6dc); box-shadow: inset 0 0 0 1px rgb(0 0 0 / .08), 0 2px 10px rgb(0 0 0 / .35); animation: crest-in var(--dur-hover, 200ms) var(--ease-spring, ease-out) both; }
.crest img { width: 78%; height: 78%; object-fit: contain; }
.sm { width: 40px; height: 40px; font-size: var(--fs-sm); }
.md { width: 72px; height: 72px; font-size: var(--fs-h3); }
.lg { width: 96px; height: 96px; font-size: var(--fs-h2); }
@keyframes crest-in { from { opacity: 0; scale: .85; } }
@media (prefers-reduced-motion: reduce) { .crest { animation: none; } }
@media (max-width: 700px) { .md { width: 56px; height: 56px; } .lg { width: 72px; height: 72px; } }
</style>
