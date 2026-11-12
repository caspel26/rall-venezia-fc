<script setup lang="ts">
defineProps<{ slug: string; kicker?: string | null; title: string; summary?: string | null; at?: string | null; size?: 'lead' | 'mid' | 'small' }>()
</script>

<template>
  <article class="story" :class="size ?? 'mid'">
    <p v-if="kicker" class="kicker">{{ kicker }}</p>
    <h3 class="hl display"><NuxtLink :to="`/news/${slug}`">{{ title }}</NuxtLink></h3>
    <p v-if="summary && size !== 'small'" class="sum">{{ summary }}</p>
    <p v-if="at" class="date">{{ formatShortDay(at) }}</p>
  </article>
</template>

<style scoped>
.story { display: grid; gap: var(--space-2); align-content: start; color: var(--paper-ink); }
.kicker { font: 600 var(--fs-cap)/1.2 var(--font-ui); letter-spacing: .12em; text-transform: uppercase; color: var(--paper-accent); }
.hl { line-height: 1.02; }
.hl a { color: inherit; text-decoration: none; }
.hl a:hover { text-decoration: underline; text-decoration-thickness: 2px; }
.sum { font: 400 var(--fs-body)/1.45 var(--font-serif); color: var(--paper-muted); }
.date { font: 600 var(--fs-cap)/1 var(--font-ui); letter-spacing: .08em; text-transform: uppercase; color: var(--paper-muted); }
.lead .hl { font-size: clamp(38px, 8vw, 76px); }
.lead .sum { font-size: var(--fs-h3); line-height: 1.35; color: var(--paper-ink); }
.mid .hl { font-size: var(--fs-h2); }
.small .hl { font-size: var(--fs-h3); }
</style>
