<script setup lang="ts">
import type { NewsCategory } from '~/utils/news'

withDefaults(defineProps<{
  slug: string; variant?: 'lead' | 'card' | 'row'; cover?: string | null; category: NewsCategory
  kicker?: string | null; title: string; summary?: string | null; at?: string | null; minutes?: number
}>(), { variant: 'card' })
</script>

<template>
  <NuxtLink :to="`/news/${slug}`" class="news" :class="[variant, 'lift']">
    <div class="media">
      <NewsCover :path="cover" :category="category" :alt="title" />
      <NewsChip v-if="variant !== 'row'" class="on-img" :category="category" glass />
      <div v-if="variant === 'lead'" class="veil" aria-hidden="true" />
    </div>
    <div class="body">
      <p v-if="kicker && variant !== 'row'" class="eyebrow k">{{ kicker }}</p>
      <h3 class="display t">{{ title }}</h3>
      <p v-if="summary && variant !== 'row'" class="sum">{{ summary }}</p>
      <p class="meta"><AppIcon :name="variant === 'row' ? NEWS_CATEGORIES[category].icon : 'clock'" :size="14" /><template v-if="minutes">{{ minutes }} min · </template><template v-if="at">{{ formatShortDay(at) }}</template></p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.news { position: relative; display: grid; text-decoration: none; color: inherit; border-radius: var(--r-card); overflow: hidden; background: var(--rv-surface); box-shadow: inset 0 0 0 1px var(--rv-line); }
.media { position: relative; overflow: hidden; }
.on-img { position: absolute; z-index: 2; top: 12px; left: 12px; }
.body { display: grid; gap: 8px; padding: 16px 20px 20px; align-content: start; }
.k { color: var(--rv-orange); }
.t { font-size: 26px; line-height: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.sum { font-size: 15px; line-height: 1.5; color: var(--rv-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--rv-muted); }
.meta svg { color: var(--rv-orange); }
@media (hover: hover) {
  .news:hover :deep(.cover > img.in) { transform: scale(1.04); }
  .news:hover .t { text-decoration: underline; text-decoration-color: var(--rv-orange-line); text-decoration-thickness: 2px; text-underline-offset: 4px; }
}
.news:focus-visible { outline: 2px solid var(--rv-orange); outline-offset: 3px; }

/* lead: the cover with the headline on it */
.lead { border-radius: var(--r-panel); }
.lead .media :deep(.cover) { aspect-ratio: 16 / 9; }
.lead .veil { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, transparent 30%, rgb(11 11 9 / .55) 55%, rgb(11 11 9 / .95) 100%); }
.lead .body { position: absolute; z-index: 2; left: 0; right: 0; bottom: 0; padding: 24px; }
.lead .t { font-size: clamp(34px, 4.4vw, 64px); max-width: 22ch; -webkit-line-clamp: 4; text-wrap: balance; }
.lead :deep(.ph) { display: none; }
.card .media :deep(.cover.stage), .row .media :deep(.cover.stage) { aspect-ratio: 16 / 7; }
.lead .sum { display: none; font-size: 18px; color: var(--rv-cream-2); }
@media (min-width: 701px) {
  .lead .media :deep(.cover) { aspect-ratio: 21 / 9; max-height: 520px; }
  .lead .body { padding: 40px; }
  .lead .sum { display: -webkit-box; max-width: 60ch; }
}
@media (hover: hover) { .lead.lift:hover { transform: none; box-shadow: inset 0 0 0 1px var(--rv-orange-line); } }

/* row */
.row { grid-template-columns: 96px 1fr; align-items: center; gap: 14px; min-height: 88px; padding: 8px; border-radius: 14px; background: var(--rv-surface-2); }
.row .media { border-radius: 10px; }
.row .media :deep(.cover) { aspect-ratio: 4 / 3; }
.row .body { padding: 0; gap: 4px; }
.row .t { font: 600 16px/1.25 var(--font-ui); -webkit-line-clamp: 2; }
</style>
