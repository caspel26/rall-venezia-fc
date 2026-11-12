<script setup lang="ts">
defineProps<{ title: string; body: string; at?: string | null; pinned?: boolean }>()
</script>

<template>
  <article class="ann">
    <p class="eyebrow">{{ pinned ? 'In evidenza' : 'Dallo spogliatoio' }}<template v-if="at"> · {{ formatShortDay(at) }}</template></p>
    <h3 class="display">{{ title }}</h3>
    <p class="muted body">{{ body }}</p>
  </article>
</template>

<style scoped>
.ann { display: grid; gap: var(--space-2); padding: var(--space-5); border-left: 3px solid var(--rv-orange); background: var(--rv-surface); border-radius: 0 var(--r-panel) var(--r-panel) 0; }
h3 { font-size: var(--fs-h2); }
.body { white-space: pre-line; }
</style>
