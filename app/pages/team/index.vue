<script setup lang="ts">
useHead({ title: 'Squadra · Rall Venezia' })
const { data: squad, status } = useSquad()
const { data: staff } = useStaff()
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Rosa" title="Squadra" lead="I giocatori del Rall Venezia." />
    <Transition name="vanish" mode="out-in">
      <div v-if="status === 'pending' && !squad" key="s" class="grid">
        <SkeletonBlock v-for="n in 6" :key="n" size="hero" />
      </div>
      <ul v-else-if="squad?.length" key="l" class="grid" aria-label="Giocatori">
        <li v-for="(p, i) in squad" :key="p.id" v-reveal="i % 4"><PlayerCard :player="p" /></li>
      </ul>
      <EmptyState v-else key="e" title="Nessun giocatore" text="La rosa è vuota. Qualcuno chiami il mister." />
    </Transition>

    <section v-if="staff?.length" class="staff">
      <SectionHeader title="Staff" />
      <ul class="grid">
        <li v-for="(m, i) in staff" :key="m.id" v-reveal="i % 4"><StaffCard :member="m" /></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); list-style: none; margin: 0; padding: 0; }
.grid > li { display: grid; }
.staff { margin-top: var(--section-space); }
@media (min-width: 701px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-4); } }
@media (min-width: 1051px) { .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-5); } }
</style>
