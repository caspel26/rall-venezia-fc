<script setup lang="ts">
import type { Database } from '~/types/database'
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Giocatori · Admin' })
const client = useSupabaseClient<Database>()
const { data, status } = useAsyncData('admin-players', async () =>
  ((await client.from('players').select('*').order('is_active', { ascending: false }).order('last_name')).data ?? []), { lazy: true })
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Admin" title="Giocatori" />
    <AdminTabs />
    <div class="row-actions top"><NuxtLink to="/admin/players/new" class="btn btn-primary">Nuovo giocatore</NuxtLink></div>
    <div v-if="status === 'pending' && !data" class="list"><SkeletonBlock v-for="n in 5" :key="n" size="sm" /></div>
    <ul v-else-if="data?.length" class="list" aria-label="Giocatori">
      <li v-for="p in data" :key="p.id" class="row">
        <PlayerAvatar :first="p.first_name" :last="p.last_name" :photo-path="p.photo_path" :size="40" />
        <span class="n display tabular">{{ p.shirt_number ?? '·' }}</span>
        <span class="nm">{{ fullName(p) }}<span v-if="!p.is_active" class="eyebrow"> · non attivo</span></span>
        <NuxtLink :to="`/admin/players/${p.id}`" class="btn btn-sm">Modifica</NuxtLink>
      </li>
    </ul>
    <EmptyState v-else title="Nessun giocatore" text="La rosa è vuota. Qualcuno chiami il mister." />
  </div>
</template>

<style scoped>
.top { margin-bottom: var(--space-4); }
.list { list-style: none; margin: 0; padding: 0; display: grid; }
.row { display: grid; grid-template-columns: 44px 32px 1fr auto; align-items: center; gap: var(--space-3); min-height: 52px; border-bottom: 1px solid var(--rv-line); }
.n { color: var(--rv-orange); font-size: var(--fs-h3); text-align: right; }
.th { width: 44px; border-radius: var(--r-pill); }
.nm { font-weight: var(--fw-ui); }
</style>
