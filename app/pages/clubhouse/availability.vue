<script setup lang="ts">
import { hasRole, STAFF_ROLES, TEAM_ROLES } from '~/types/domain'

definePageMeta({ roles: TEAM_ROLES })
useHead({ title: 'Disponibilità · Rall Venezia' })
const { data, status } = useAvailabilityBoard()
const { role } = useAuth()
const isStaff = computed(() => hasRole(role.value, STAFF_ROLES))

const sections = [
  { key: 'available', label: 'Ci sono', cls: 'ok' },
  { key: 'maybe', label: 'Forse', cls: 'maybe' },
  { key: 'unavailable', label: 'Non ci sono', cls: 'no' },
  { key: 'none', label: 'Senza risposta', cls: 'none' },
] as const

const time = (iso: string) => `${formatShortDay(iso)} ${formatTime(iso)}`
</script>

<template>
  <div class="page">
    <NuxtLink to="/clubhouse" class="muted back">← Spogliatoio</NuxtLink>
    <PageHero eyebrow="Prossima partita" title="Disponibilità" />

    <SkeletonBlock v-if="status === 'pending' && data === undefined" size="hero" />
    <template v-else-if="data">
      <p class="vs display">Rall Venezia vs {{ data.match.opponent?.name }}</p>
      <p class="muted when">{{ formatDay(data.match.kickoff_at) }} · {{ formatTime(data.match.kickoff_at) }}</p>

      <div v-if="data.myPlayerId" class="panel mine">
        <p class="eyebrow">La tua risposta</p>
        <AvailabilitySelector :match-id="data.match.id" :current="data.myAnswer" />
      </div>

      <div class="cols">
        <section v-for="s in sections" :key="s.key" class="panel" :aria-label="s.label">
          <h2 class="eyebrow" :class="s.cls">{{ s.label }} <span class="tabular">({{ data.groups[s.key].length }})</span></h2>
          <ul v-if="data.groups[s.key].length" class="names">
            <li v-for="x in data.groups[s.key]" :key="x.player.id">
              <NuxtLink :to="`/team/${x.player.slug}`">{{ fullName(x.player) }}</NuxtLink>
              <span v-if="isStaff && x.at" class="muted at">{{ time(x.at) }}</span>
            </li>
          </ul>
          <p v-else class="muted">Nessuno.</p>
        </section>
      </div>
    </template>
    <EmptyState v-else title="Nessuna partita in programma" text="Per una volta possiamo riposare." />
  </div>
</template>

<style scoped>
.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }
.vs { font-size: var(--fs-h1); }
.when { margin-bottom: var(--space-5); }
.mine { display: grid; gap: var(--space-3); margin-bottom: var(--space-5); }
.cols { display: grid; gap: var(--space-4); }
.names { list-style: none; margin: var(--space-3) 0 0; padding: 0; display: grid; }
.names li { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); min-height: 44px; border-bottom: 1px solid var(--rv-line); }
.names a { text-decoration: none; font-weight: var(--fw-ui); }
.at { font-size: var(--fs-cap); }
.ok { color: var(--rv-green); } .maybe { color: var(--rv-amber); } .no { color: var(--rv-red); }
@media (min-width: 701px) { .cols { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1051px) { .cols { grid-template-columns: repeat(4, 1fr); } }
</style>
