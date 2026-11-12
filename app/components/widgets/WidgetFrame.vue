<script setup lang="ts">
// Common chrome for a widget: titled region, optional "see all" link, skeleton while loading.
defineProps<{ title: string; to?: string; linkLabel?: string; loading?: boolean; bare?: boolean }>()
</script>

<template>
  <section v-reveal class="w" :class="{ panel: !bare }" :aria-label="title">
    <header v-if="!bare" class="wh">
      <h2 class="eyebrow">{{ title }}</h2>
      <NuxtLink v-if="to" :to="to" class="muted more">{{ linkLabel ?? 'Vedi tutto' }}</NuxtLink>
    </header>
    <Transition name="vanish" mode="out-in">
      <SkeletonBlock v-if="loading" key="skeleton" size="md" />
      <div v-else key="content" class="wc"><slot /></div>
    </Transition>
  </section>
</template>

<style scoped>
.w { display: grid; gap: var(--space-4); min-width: 0; }
.wc { display: grid; gap: var(--space-4); min-width: 0; }
.wh { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); }
.more { font-size: var(--fs-sm); }
</style>
