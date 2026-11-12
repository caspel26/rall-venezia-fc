<script setup lang="ts">
import type { Database } from '~/types/database'
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Modifica partita · Admin' })
const route = useRoute()
const client = useSupabaseClient<Database>()
const id = String(route.params.id)
const { data: match, status } = useAsyncData(`admin-match-${id}`, async () => (await client.from('matches').select('*').eq('id', id).maybeSingle()).data, { lazy: true })

const confirmDelete = ref(false)
async function remove() {
  const { error } = await client.from('matches').delete().eq('id', id)
  if (!error) await navigateTo('/admin/matches')
}
</script>

<template>
  <div class="page">
    <NuxtLink to="/admin/matches" class="muted back">← Partite</NuxtLink>
    <PageHero eyebrow="Admin" title="Modifica partita" />
    <SkeletonBlock v-if="status === 'pending' && !match" size="hero" />
    <MatchForm v-else-if="match" :match="match" @saved="navigateTo('/admin/matches')">
      <NuxtLink :to="`/admin/matches/${id}/result`" class="btn">Risultato</NuxtLink>
      <button v-if="!confirmDelete" type="button" class="btn btn-danger" @click="confirmDelete = true">Elimina</button>
      <button v-else type="button" class="btn btn-danger" @click="remove">Conferma eliminazione</button>
    </MatchForm>
    <EmptyState v-else title="Partita non trovata" />
  </div>
</template>

<style scoped>.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }</style>
