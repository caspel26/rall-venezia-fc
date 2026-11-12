<script setup lang="ts">
import type { NewsCategory } from '~/utils/news'
defineProps<{ category: NewsCategory; glass?: boolean }>()
</script>

<template>
  <span class="chip-i" :class="{ glass }"><AppIcon :name="NEWS_CATEGORIES[category].icon" :size="14" />{{ NEWS_CATEGORIES[category].label }}</span>
</template>
