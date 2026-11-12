<script setup lang="ts">
import type { Database } from '~/types/database'
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Pagelle · Admin' })
const client = useSupabaseClient<Database>()
const { data, refresh, status } = useAsyncData('admin-ratings', async () =>
  ((await client.from('ratings').select('id, score, published, match_id, player:players(first_name, last_name), match:matches(kickoff_at, opponent:opponents(name))')
    .order('created_at', { ascending: false })).data ?? [])
    .sort((a, b) => (b.match?.kickoff_at ?? '').localeCompare(a.match?.kickoff_at ?? '')), { lazy: true })

const drafts = computed(() => (data.value ?? []).filter((r) => !r.published).length)
async function setPublished(id: string, published: boolean) {
  await client.from('ratings').update({ published }).eq('id', id)
  await refresh()
}
async function publishAll() {
  await client.from('ratings').update({ published: true }).eq('published', false)
  await refresh()
}
const confirming = ref('')
async function remove(id: string) {
  await client.from('ratings').delete().eq('id', id)
  confirming.value = ''
  await refresh()
}
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Admin" title="Pagelle" lead="Le pagelle si scrivono nel flusso post-partita." />
    <AdminTabs />
    <div v-if="drafts" class="row-actions top">
      <span class="muted">{{ drafts }} in bozza</span>
      <button class="btn btn-sm btn-primary" type="button" @click="publishAll">Pubblica tutte</button>
    </div>
    <SkeletonBlock v-if="status === 'pending' && !data" size="lg" />
    <ul v-else-if="data?.length" class="list" aria-label="Pagelle">
      <li v-for="r in data" :key="r.id" class="row">
        <span class="s display tabular">{{ formatRating(Number(r.score)) }}</span>
        <div>
          <p class="nm">{{ r.player ? fullName(r.player) : '' }}</p>
          <p class="muted sm">vs {{ r.match?.opponent?.name }} · {{ r.match ? formatShortDay(r.match.kickoff_at) : '' }}<span v-if="!r.published" class="draft"> · bozza</span></p>
        </div>
        <div class="row-actions">
          <NuxtLink :to="`/admin/matches/${r.match_id}/result`" class="btn btn-sm">Modifica</NuxtLink>
          <button class="btn btn-sm" type="button" @click="setPublished(r.id, !r.published)">{{ r.published ? 'Nascondi' : 'Pubblica' }}</button>
          <button v-if="confirming !== r.id" class="btn btn-sm btn-danger" type="button" @click="confirming = r.id">Elimina</button>
          <button v-else class="btn btn-sm btn-danger" type="button" @click="remove(r.id)">Conferma</button>
        </div>
      </li>
    </ul>
    <EmptyState v-else title="Nessuna pagella ancora" text="Il giudice è in ritardo." />
  </div>
</template>

<style scoped>
.top { margin-bottom: var(--space-4); }
.list { list-style: none; margin: 0; padding: 0; display: grid; }
.row { display: grid; grid-template-columns: 56px 1fr; gap: var(--space-3); align-items: center; padding: var(--space-3) 0; border-bottom: 1px solid var(--rv-line); }
.row .row-actions { grid-column: 1 / -1; }
.s { font-size: var(--fs-h1); color: var(--rv-orange); }
.nm { font-weight: var(--fw-ui); }
.sm { font-size: var(--fs-sm); }
.draft { color: var(--rv-amber); }
@media (min-width: 1051px) { .row { grid-template-columns: 56px 1fr auto; } .row .row-actions { grid-column: auto; } }
</style>
