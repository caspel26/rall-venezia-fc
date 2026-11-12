<script setup lang="ts">
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Partite · Admin' })
const { data, status } = useMatches()
const list = computed(() => filterMatches(data.value?.matches ?? [], { state: 'all', season: '', competition: '' }))
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Admin" title="Partite" />
    <AdminTabs />
    <div class="row-actions top"><NuxtLink to="/admin/matches/new" class="btn btn-primary">Nuova partita</NuxtLink></div>
    <div v-if="status === 'pending' && !data" class="list"><SkeletonBlock v-for="n in 4" :key="n" size="sm" /></div>
    <ul v-else-if="list.length" class="list" aria-label="Partite">
      <li v-for="m in list" :key="m.id" class="item">
        <MatchCard :opponent="m.opponent?.name ?? ''" :short="m.opponent?.short_name" :is-home="m.is_home" :kickoff-at="m.kickoff_at"
          :competition="m.competition?.name" :status="m.status" :rv="m.rv_score" :opp="m.opp_score" />
        <div class="row-actions">
          <NuxtLink :to="`/admin/matches/${m.id}/result`" class="btn btn-sm btn-primary">{{ m.status === 'completed' ? 'Modifica risultato' : 'Inserisci risultato' }}</NuxtLink>
          <NuxtLink :to="`/admin/matches/${m.id}`" class="btn btn-sm">Modifica partita</NuxtLink>
          <span v-if="!m.published" class="eyebrow">Bozza</span>
        </div>
      </li>
    </ul>
    <EmptyState v-else title="Nessuna partita" text="Programma la prima." />
  </div>
</template>

<style scoped>
.top { margin-bottom: var(--space-4); }
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-4); }
.item { display: grid; gap: var(--space-2); }
</style>
