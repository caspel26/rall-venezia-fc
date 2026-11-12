<script setup lang="ts">
useHead({ title: 'Partite · Rall Venezia' })
const { data, status } = useMatches()

const filters = reactive<MatchFilters>({ state: 'all', season: '', competition: '' })
const states = [
  { key: 'all', label: 'Tutte' },
  { key: 'upcoming', label: 'In programma' },
  { key: 'completed', label: 'Giocate' },
]
const list = computed(() => filterMatches(data.value?.matches ?? [], filters))
const emptyText = computed(() =>
  filters.state === 'upcoming'
    ? { title: 'Nessuna partita in programma', text: 'Per una volta possiamo riposare.' }
    : { title: 'Nessuna partita trovata', text: 'Prova a cambiare i filtri.' })
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Calendario" title="Partite" lead="Tutte le partite del Rall Venezia." />

    <div class="filters">
      <Segmented v-model="filters.state" :items="states" label="Stato delle partite" />
      <div class="selects">
        <label class="sel"><span class="sr-only">Stagione</span>
          <select v-model="filters.season" class="input" aria-label="Stagione">
            <option value="">Tutte le stagioni</option>
            <option v-for="s in data?.seasons" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </label>
        <label class="sel"><span class="sr-only">Competizione</span>
          <select v-model="filters.competition" class="input" aria-label="Competizione">
            <option value="">Tutte le competizioni</option>
            <option v-for="c in data?.competitions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </label>
      </div>
    </div>

    <Transition name="vanish" mode="out-in">
    <div v-if="status === 'pending' && !data" key="s" class="list"><SkeletonBlock v-for="n in 5" :key="n" size="sm" /></div>
    <ul v-else-if="list.length" key="l" class="list" aria-label="Partite">
      <li v-for="(m, i) in list" :key="m.id" v-reveal="i % 5">
        <MatchCard :to="`/matches/${m.id}`" :opponent="m.opponent?.name ?? ''" :short="m.opponent?.short_name" :is-home="m.is_home"
          :kickoff-at="m.kickoff_at" :competition="m.competition?.name" :status="m.status" :rv="m.rv_score" :opp="m.opp_score" />
      </li>
    </ul>
    <EmptyState v-else key="e" :title="emptyText.title" :text="emptyText.text" />
    </Transition>
  </div>
</template>

<style scoped>
.filters { display: grid; gap: var(--space-3); margin-bottom: var(--space-5); justify-items: start; }
.selects { display: grid; gap: var(--space-2); width: 100%; }
.list { display: grid; gap: var(--space-3); list-style: none; margin: 0; padding: 0; }
@media (min-width: 701px) {
  .filters { grid-template-columns: auto 1fr; align-items: center; }
  .selects { grid-template-columns: 1fr 1fr; justify-self: end; max-width: 520px; }
}
</style>
