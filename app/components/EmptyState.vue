<script setup lang="ts">
defineProps<{ title: string; text?: string }>()
</script>

<template>
  <div class="empty">
    <p class="display t">{{ title }}</p>
    <p v-if="text" class="muted">{{ text }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty { display: grid; gap: var(--space-2); padding: var(--space-6) var(--space-5); border: 1px dashed var(--rv-line); border-radius: var(--r-panel); justify-items: start; }
.t { font-size: var(--fs-h2); }
</style>
