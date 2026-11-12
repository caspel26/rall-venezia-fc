<script setup lang="ts">
import { TEAM_ROLES } from '~/types/domain'

definePageMeta({ roles: TEAM_ROLES })
useHead({ title: 'Spogliatoio · Rall Venezia' })
const board = useAvailabilityBoard()
const ann = useAnnouncements(3)
const counts = computed(() => {
  const g = board.data.value?.groups
  return g ? { available: g.available.length, maybe: g.maybe.length, unavailable: g.unavailable.length, noResponse: g.none.length } : null
})
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Riservato" title="Spogliatoio" lead="Quello che succede nello spogliatoio resta nello spogliatoio." />

    <div class="grid">
      <section class="panel" aria-labelledby="av">
        <header class="h"><h2 id="av" class="eyebrow">Disponibilità</h2><NuxtLink to="/clubhouse/availability" class="muted more">Chi c’è</NuxtLink></header>
        <template v-if="board.data.value">
          <p class="vs display">Rall Venezia vs {{ board.data.value.match.opponent?.name }}</p>
          <p class="muted">{{ formatDay(board.data.value.match.kickoff_at) }} · {{ formatTime(board.data.value.match.kickoff_at) }}</p>
          <AvailabilitySelector v-if="board.data.value.myPlayerId" :match-id="board.data.value.match.id" :current="board.data.value.myAnswer" />
          <AvailabilitySummary v-if="counts" :counts="counts" />
        </template>
        <EmptyState v-else-if="board.status.value !== 'pending'" title="Nessuna partita in programma" text="Per una volta possiamo riposare." />
        <SkeletonBlock v-else size="lg" />
      </section>

      <section class="panel" aria-labelledby="an">
        <header class="h"><h2 id="an" class="eyebrow">Annunci</h2><NuxtLink to="/clubhouse/announcements" class="muted more">Tutti</NuxtLink></header>
        <div v-if="ann.data.value?.length" class="stack">
          <AnnouncementCard v-for="a in ann.data.value" :key="a.id" :title="a.title" :body="a.body" :at="a.published_at" :pinned="a.pinned" />
        </div>
        <EmptyState v-else-if="ann.status.value !== 'pending'" title="Nessun annuncio" text="Lo spogliatoio è in silenzio." />
        <SkeletonBlock v-else size="lg" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; gap: var(--space-5); align-items: start; }
.h { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-3); }
.more { font-size: var(--fs-sm); }
.panel { display: grid; gap: var(--space-3); }
.vs { font-size: var(--fs-h1); }
.stack { display: grid; gap: var(--space-3); }
@media (min-width: 1051px) { .grid { grid-template-columns: 1fr 1fr; gap: var(--space-6); } }
</style>
