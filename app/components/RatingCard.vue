<script setup lang="ts">
defineProps<{ score: number; player: string; review?: string | null; attributes?: string[]; context?: string }>()
</script>

<template>
  <article class="rating">
    <p class="score display tabular">{{ formatRating(score) }}</p>
    <div class="body">
      <h3 class="display name">{{ player }}</h3>
      <p v-if="context" class="eyebrow">{{ context }}</p>
      <p v-if="review" class="review">{{ review }}</p>
      <ul v-if="attributes?.length" class="attrs" aria-label="Punti di forza">
        <li v-for="a in attributes" :key="a" class="chip">{{ a }}</li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.rating { display: grid; grid-template-columns: auto 1fr; gap: var(--space-4); align-items: start; padding: var(--space-5); border: 1px solid var(--rv-line); border-radius: var(--r-panel); background: var(--rv-surface); }
.score { font-size: var(--fs-display); line-height: .9; color: var(--rv-orange); }
.body { display: grid; gap: var(--space-2); min-width: 0; }
.name { font-size: var(--fs-h2); }
.review { color: var(--rv-cream); }
.attrs { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
.chip { padding: 2px var(--space-3); border: 1px solid var(--rv-line); border-radius: var(--r-pill); font-size: var(--fs-cap); letter-spacing: .08em; font-weight: var(--fw-ui); color: var(--rv-muted); }
</style>
