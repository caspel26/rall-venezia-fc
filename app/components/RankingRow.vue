<script setup lang="ts">
defineProps<{ position: number; name: string; slug: string; value: string | number; sub?: string }>()
</script>

<template>
  <li class="row">
    <span class="pos display tabular" :class="{ gold: position === 1 }">{{ position }}</span>
    <NuxtLink :to="`/team/${slug}`" class="nm">{{ name }}<span v-if="sub" class="muted sub"> · {{ sub }}</span></NuxtLink>
    <span class="v display tabular">{{ value }}</span>
  </li>
</template>

<style scoped>
.row { display: grid; grid-template-columns: 32px 1fr auto; align-items: center; gap: var(--space-3); min-height: 48px; border-bottom: 1px solid var(--rv-line); }
.pos { color: var(--rv-muted); font-size: var(--fs-h3); }
.pos.gold { color: var(--rv-gold); }
.nm { text-decoration: none; font-weight: var(--fw-ui); overflow-wrap: anywhere; }
.sub { font-weight: var(--fw-text); font-size: var(--fs-sm); }
.v { font-size: var(--fs-h2); }
</style>
