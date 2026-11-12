<script setup lang="ts">
import type { AvailabilityCounts } from '~/utils/results'
const props = defineProps<{ counts: AvailabilityCounts }>()
const cells = computed(() => [
  { label: 'Ci sono', value: props.counts.available, cls: 'ok' },
  { label: 'Forse', value: props.counts.maybe, cls: 'maybe' },
  { label: 'Non ci sono', value: props.counts.unavailable, cls: 'no' },
  { label: 'Senza risposta', value: props.counts.noResponse, cls: '' },
])
</script>

<template>
  <dl class="sum">
    <div v-for="c in cells" :key="c.label"><dt>{{ c.label }}</dt>
      <dd class="display tabular" :class="c.cls"><Transition name="tick" mode="out-in"><span :key="c.value" class="num">{{ c.value }}</span></Transition></dd></div>
  </dl>
</template>

<style scoped>
.sum { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); margin: 0; }
dt { font-size: var(--fs-cap); color: var(--rv-muted); font-weight: var(--fw-ui); }
dd { margin: 0; font-size: var(--fs-h1); position: relative; }
.num { display: inline-block; }
.ok { color: var(--rv-green); } .maybe { color: var(--rv-amber); } .no { color: var(--rv-red); }
</style>
