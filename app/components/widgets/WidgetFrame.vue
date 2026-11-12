<script setup lang="ts">
import type { IconName } from '~/components/AppIcon.vue'
// Common chrome for a widget: icon + title, optional "see all" chip, vanish swap from the skeleton.
defineProps<{ title: string; icon: IconName; to?: string; linkLabel?: string; loading?: boolean; bare?: boolean }>()
</script>

<template>
  <section v-reveal class="w" :class="{ panel: !bare }" :aria-label="title">
    <header class="wh">
      <h2 class="t"><AppIcon :name="icon" :size="18" />{{ title }}</h2>
      <NuxtLink v-if="to" :to="to" class="link-chip">{{ linkLabel ?? 'Vedi tutto' }}<AppIcon name="arrow-right" :size="14" /></NuxtLink>
    </header>
    <Transition name="vanish" mode="out-in">
      <SkeletonBlock v-if="loading" key="skeleton" size="md" />
      <div v-else key="content" class="wc"><slot /></div>
    </Transition>
  </section>
</template>

<style scoped>
.w { display: grid; gap: 16px; min-width: 0; }
.wh { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); min-height: 32px; }
.t { display: flex; align-items: center; gap: 8px; margin: 0; font: 700 13px/1 var(--font-ui); letter-spacing: .12em; text-transform: uppercase; color: var(--rv-cream); }
.t svg { color: var(--rv-orange); }
.wc { display: grid; gap: 16px; min-width: 0; }
</style>
