<script setup lang="ts">
import { hasRole, STAFF_ROLES, TEAM_ROLES } from '~/types/domain'

definePageMeta({ roles: TEAM_ROLES })
useHead({ title: 'Sondaggio · Rall Venezia' })
const { data, status, refresh } = useWeeklyPoll()
const { data: squad } = useSquad()
const { role } = useAuth()
const isStaff = computed(() => hasRole(role.value, STAFF_ROLES))
const name = (id: string) => { const p = squad.value?.find((x) => x.id === id); return p ? fullName(p) : '' }

const opening = ref(false)
const msg = ref('')
async function openNext() {
  opening.value = true
  msg.value = ''
  try {
    await $fetch('/api/polls/ensure', { method: 'POST', body: { force: true } })
    await refresh()
  } catch { msg.value = 'Non siamo riusciti ad aprire il sondaggio.' }
  opening.value = false
}
</script>

<template>
  <div class="page">
    <NuxtLink to="/clubhouse" class="muted back">← Spogliatoio</NuxtLink>
    <PageHero eyebrow="Disponibilità" title="Sondaggio" lead="Scegli tutti i giorni da lunedì a venerdì in cui ci sei. Puoi cambiare idea finché il sondaggio è aperto." />

    <SkeletonBlock v-if="status === 'pending' && data === undefined" size="hero" />
    <template v-else-if="data">
      <p class="eyebrow range">Settimana dal {{ pollDay(data.days[0]!.date).full }} al {{ pollDay(data.days[4]!.date).full }}</p>
      <section class="panel"><PollVote :poll-id="data.poll.id" :days="data.days" :mine="data.mine" :best="data.best" :top="data.top" :can-vote="!!data.myPlayerId" @saved="refresh()" /></section>

      <ul class="cols" aria-label="Chi viene, giorno per giorno">
        <li v-for="d in data.days" :key="d.date" class="panel" :class="{ best: data.best.includes(d.date) }">
          <h2 class="eyebrow">{{ pollDay(d.date).full }} <span class="tabular">({{ d.n }})</span></h2>
          <ul v-if="d.voters.length" class="names"><li v-for="id in d.voters" :key="id">{{ name(id) }}</li></ul>
          <p v-else class="muted">Nessuno per ora.</p>
        </li>
      </ul>
    </template>
    <EmptyState v-else title="Nessun sondaggio aperto" text="Si apre da solo il giorno dopo la partita, per la settimana successiva.">
      <button v-if="isStaff" class="btn btn-primary" type="button" :disabled="opening" @click="openNext">Apri il sondaggio della prossima settimana</button>
      <p v-if="msg" class="notice bad" role="alert">{{ msg }}</p>
    </EmptyState>
  </div>
</template>

<style scoped>
.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }
.range { margin-bottom: var(--space-3); text-transform: capitalize; }
.cols { list-style: none; margin: var(--space-5) 0 0; padding: 0; display: grid; gap: var(--space-3); }
.cols .best { border-color: var(--rv-gold); }
.names { list-style: none; margin: var(--space-2) 0 0; padding: 0; display: grid; gap: var(--space-1); }
.names li { font-weight: var(--fw-ui); }
@media (min-width: 701px) { .cols { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1051px) { .cols { grid-template-columns: repeat(5, 1fr); } }
</style>
