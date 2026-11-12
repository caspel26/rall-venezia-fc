<script setup lang="ts">
defineProps<{ title: string; to?: string; linkLabel?: string }>()
</script>

<template>
  <div class="sh">
    <h2 class="display">{{ title }}</h2>
    <NuxtLink v-if="to" :to="to" class="muted more">{{ linkLabel ?? 'Vedi tutto' }}</NuxtLink>
  </div>
</template>

<style scoped>
.sh { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-4); }
h2 { font-size: var(--fs-h2); }
.more { font-size: var(--fs-sm); }
</style>
