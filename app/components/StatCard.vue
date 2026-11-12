<script setup lang="ts">
const props = defineProps<{ label: string; value: number | string; sub?: string }>()
const reduced = useReducedMotion()
const shown = ref<number | string>(props.value)

// Count up on first view; SSR and reduced motion render the final value straight away.
onMounted(() => {
  if (typeof props.value !== 'number' || reduced.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const target = props.value
  const start = performance.now()
  const run = (t: number) => {
    const k = Math.min(1, (t - start) / 900)
    shown.value = Math.round(target * (1 - Math.pow(1 - k, 3)))
    if (k < 1) requestAnimationFrame(run)
  }
  shown.value = 0
  requestAnimationFrame(run)
})
</script>

<template>
  <div class="stat">
    <p class="eyebrow">{{ label }}</p>
    <p class="v display tabular">{{ shown }}</p>
    <p v-if="sub" class="muted s">{{ sub }}</p>
  </div>
</template>

<style scoped>
.stat { display: grid; gap: var(--space-1); }
.v { font-size: var(--fs-display); }
.s { font-size: var(--fs-sm); }
</style>
