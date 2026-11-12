<script setup lang="ts">
import type { AvailabilityCounts } from '~/utils/results'
defineProps<{ counts: AvailabilityCounts }>()
</script>

<template>
  <dl class="sum">
    <div><dt>Ci sono</dt><dd class="display tabular ok">{{ counts.available }}</dd></div>
    <div><dt>Forse</dt><dd class="display tabular maybe">{{ counts.maybe }}</dd></div>
    <div><dt>Non ci sono</dt><dd class="display tabular no">{{ counts.unavailable }}</dd></div>
    <div><dt>Senza risposta</dt><dd class="display tabular">{{ counts.noResponse }}</dd></div>
  </dl>
</template>

<style scoped>
.sum { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); margin: 0; }
dt { font-size: var(--fs-cap); color: var(--rv-muted); font-weight: var(--fw-ui); }
dd { margin: 0; font-size: var(--fs-h1); }
.ok { color: var(--rv-green); } .maybe { color: var(--rv-amber); } .no { color: var(--rv-red); }
</style>
