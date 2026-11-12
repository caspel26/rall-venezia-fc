<script setup lang="ts">
const { rows, status } = useRanking('goals', 5)
</script>

<template>
  <WidgetFrame v-if="rows.length || status === 'pending'" title="Classifica marcatori" to="/stats" link-label="Tutte le stats" :loading="status === 'pending' && !rows.length">
    <ol class="rank">
      <li v-for="(r, i) in rows" :key="r.player.id">
        <span class="pos display tabular">{{ i + 1 }}</span>
        <NuxtLink :to="`/team/${r.player.slug}`" class="nm">{{ fullName(r.player) }}</NuxtLink>
        <span class="v display tabular">{{ r.value }}</span>
      </li>
    </ol>
  </WidgetFrame>
</template>

<style scoped>
.rank { list-style: none; margin: 0; padding: 0; display: grid; }
.rank li { display: grid; grid-template-columns: 32px 1fr auto; align-items: center; gap: var(--space-3); min-height: 44px; border-bottom: 1px solid var(--rv-line); }
.pos { color: var(--rv-muted); font-size: var(--fs-h3); }
.rank li:first-child .pos { color: var(--rv-gold); }
.nm { text-decoration: none; font-weight: var(--fw-ui); }
.v { font-size: var(--fs-h2); }
</style>
