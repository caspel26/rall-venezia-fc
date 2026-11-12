<script setup lang="ts">
import type { Database } from '~/types/database'
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Modifica giocatore · Admin' })
const client = useSupabaseClient<Database>()
const id = String(useRoute().params.id)
const confirmDelete = ref(false)
const deleteError = ref('')
async function remove() {
  const { error } = await client.from('players').delete().eq('id', id)
  if (error) { deleteError.value = 'Ha già partite o statistiche: disattivalo invece di eliminarlo.'; confirmDelete.value = false; return }
  await navigateTo('/admin/players')
}
const { data: player, status } = useAsyncData(`admin-player-${id}`, async () => (await client.from('players').select('*').eq('id', id).maybeSingle()).data, { lazy: true })
</script>

<template>
  <div class="page">
    <NuxtLink to="/admin/players" class="muted back">← Giocatori</NuxtLink>
    <PageHero eyebrow="Admin" title="Modifica giocatore" />
    <SkeletonBlock v-if="status === 'pending' && !player" size="hero" />
    <PlayerForm v-else-if="player" :player="player" @saved="navigateTo('/admin/players')">
      <button v-if="!confirmDelete" type="button" class="btn btn-danger" @click="confirmDelete = true">Elimina</button>
      <button v-else type="button" class="btn btn-danger" @click="remove">Conferma eliminazione</button>
    </PlayerForm>
    <p v-if="deleteError" class="notice bad" role="alert">{{ deleteError }}</p>
    <EmptyState v-else title="Giocatore non trovato" />
  </div>
</template>

<style scoped>.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }</style>
