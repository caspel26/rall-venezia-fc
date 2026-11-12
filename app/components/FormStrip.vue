<script setup lang="ts">
import type { ResultLetter } from '~/utils/results'
defineProps<{ form: ResultLetter[] }>()
</script>

<template>
  <div class="strip" role="list" aria-label="Ultimi risultati">
    <ResultPill v-for="(r, i) in form" :key="i" :result="r" role="listitem" />
  </div>
</template>

<style scoped>
.strip { display: flex; gap: var(--space-2); }
</style>
