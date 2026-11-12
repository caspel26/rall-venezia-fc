<script setup lang="ts">
import type { AvailabilityCounts } from '~/utils/results'
const props = defineProps<{ counts: AvailabilityCounts }>()
const cells = computed(() => [
  { label: 'Ci sono', value: props.counts.available, cls: 'ok', color: 'var(--rv-green)' },
  { label: 'Forse', value: props.counts.maybe, cls: 'maybe', color: 'var(--rv-amber)' },
  { label: 'Non ci sono', value: props.counts.unavailable, cls: 'no', color: 'var(--rv-red)' },
  { label: 'Senza risposta', value: props.counts.noResponse, cls: '', color: 'var(--rv-surface-3)' },
])
const total = computed(() => Math.max(1, cells.value.reduce((a, c) => a + c.value, 0)))
</script>

<template>
  <div>
    <div class="bar" role="img" :aria-label="cells.map((c) => `${c.label} ${c.value}`).join(', ')">
      <i v-for="c in cells" :key="c.label" :style="{ width: `${(c.value / total) * 100}%`, background: c.color }" />
    </div>
    <dl class="sum">
      <div v-for="c in cells" :key="c.label"><dt>{{ c.label }}</dt>
        <dd class="display tabular" :class="c.cls"><Transition name="tick" mode="out-in"><span :key="c.value" class="num">{{ c.value }}</span></Transition></dd></div>
    </dl>
  </div>
</template>

<style scoped>
.bar { display: flex; gap: 2px; height: 8px; border-radius: var(--r-pill); overflow: hidden; background: var(--rv-surface-3); margin-bottom: 14px; }
.bar i { display: block; height: 100%; transition: width 600ms var(--ease-out); }
.sum { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); margin: 0; }
dt { font-size: var(--fs-cap); color: var(--rv-muted); font-weight: var(--fw-ui); }
dd { margin: 0; font-size: 28px; line-height: 1.1; position: relative; }
.num { display: inline-block; }
.ok { color: var(--rv-green); } .maybe { color: var(--rv-amber); } .no { color: var(--rv-red); }
</style>
