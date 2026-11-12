<script setup lang="ts">
useHead({ title: 'Squadra · Rall Venezia' })
const { data: squad, status } = useSquad()
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Rosa" title="Squadra" lead="I giocatori del Rall Venezia." />
    <div v-if="status === 'pending' && !squad" class="grid">
      <SkeletonBlock v-for="n in 6" :key="n" size="hero" />
    </div>
    <ul v-else-if="squad?.length" class="grid" aria-label="Giocatori">
      <li v-for="p in squad" :key="p.id"><PlayerCard :player="p" /></li>
    </ul>
    <EmptyState v-else title="Nessun giocatore" text="La rosa è vuota. Qualcuno chiami il mister." />
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); list-style: none; margin: 0; padding: 0; }
.grid > li { display: grid; }
@media (min-width: 701px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-4); } }
@media (min-width: 1051px) { .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-5); } }
</style>
