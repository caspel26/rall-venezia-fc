<script setup lang="ts">
import { TEAM_ROLES } from '~/types/domain'

definePageMeta({ roles: TEAM_ROLES })
useHead({ title: 'Pagelle · Rall Venezia' })
const { data, status } = useRatings()

const player = ref('')
const match = ref('')
const players = computed(() => {
  const m = new Map<string, string>()
  for (const r of data.value ?? []) if (r.player) m.set(r.player.id, fullName(r.player))
  return [...m].sort((a, b) => a[1].localeCompare(b[1], 'it'))
})
const matches = computed(() => {
  const m = new Map<string, string>()
  for (const r of data.value ?? []) if (r.match) m.set(r.match.id, `${r.match.opponent?.name} · ${formatShortDay(r.match.kickoff_at)}`)
  return [...m]
})
const list = computed(() => (data.value ?? []).filter((r) => (!player.value || r.player?.id === player.value) && (!match.value || r.match?.id === match.value)))
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Archivio" title="Pagelle" lead="Voti e giudizi dopo ogni partita." />
    <div class="filters">
      <select v-model="player" class="input" aria-label="Giocatore">
        <option value="">Tutti i giocatori</option>
        <option v-for="[id, n] in players" :key="id" :value="id">{{ n }}</option>
      </select>
      <select v-model="match" class="input" aria-label="Partita">
        <option value="">Tutte le partite</option>
        <option v-for="[id, n] in matches" :key="id" :value="id">{{ n }}</option>
      </select>
    </div>

    <Transition name="vanish" mode="out-in">
    <div v-if="status === 'pending' && !data" key="s" class="list"><SkeletonBlock v-for="n in 3" :key="n" size="lg" /></div>
    <ul v-else-if="list.length" key="l" class="list" aria-label="Pagelle">
      <li v-for="(r, i) in list" :key="r.id" v-reveal="i % 4">
        <RatingCard :score="Number(r.score)" :player="r.player ? fullName(r.player) : ''" :review="r.review" :attributes="r.attributes"
          :context="r.match ? `vs ${r.match.opponent?.name} · ${formatShortDay(r.match.kickoff_at)}` : undefined" />
      </li>
    </ul>
    <EmptyState v-else-if="data?.length" key="e1" title="Nessuna pagella con questi filtri" text="Allarga la ricerca." />
    <EmptyState v-else key="e2" title="Nessuna pagella ancora" text="Il giudice è in ritardo." />
    </Transition>
  </div>
</template>

<style scoped>
.filters { display: grid; gap: var(--space-2); margin-bottom: var(--space-5); }
.list { display: grid; gap: var(--space-3); list-style: none; margin: 0; padding: 0; }
@media (min-width: 701px) { .filters { grid-template-columns: 1fr 1fr; max-width: 640px; } }
@media (min-width: 1051px) { .list { grid-template-columns: 1fr 1fr; } }
</style>
