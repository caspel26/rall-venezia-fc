<script setup lang="ts">
import type { Database } from '~/types/database'
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Annunci · Admin' })
const client = useSupabaseClient<Database>()
const { data, refresh, status } = useAsyncData('admin-announcements', async () =>
  ((await client.from('announcements').select('*').order('created_at', { ascending: false })).data ?? []), { lazy: true })

const blank = () => ({ id: '', title: '', body: '', pinned: false, publish: true })
const f = reactive(blank())
const error = ref('')
const busy = ref(false)

function edit(a: NonNullable<typeof data.value>[number]) {
  Object.assign(f, { id: a.id, title: a.title, body: a.body, pinned: a.pinned, publish: !!a.published_at })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
async function save() {
  error.value = ''
  if (!f.title.trim() || !f.body.trim()) { error.value = 'Titolo e testo sono obbligatori.'; return }
  busy.value = true
  const existing = data.value?.find((a) => a.id === f.id)
  const row = { title: f.title.trim(), body: f.body.trim(), pinned: f.pinned,
    published_at: f.publish ? (existing?.published_at ?? new Date().toISOString()) : null }
  const { error: e } = f.id ? await client.from('announcements').update(row).eq('id', f.id) : await client.from('announcements').insert(row)
  busy.value = false
  if (e) { error.value = 'Non siamo riusciti a salvare l’annuncio.'; return }
  Object.assign(f, blank())
  await refresh()
}
const confirming = ref('')
async function remove(id: string) {
  await client.from('announcements').delete().eq('id', id)
  confirming.value = ''
  await refresh()
}
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Admin" title="Annunci" />
    <AdminTabs />
    <form class="form-grid panel" novalidate @submit.prevent="save">
      <h2 class="eyebrow">{{ f.id ? 'Modifica annuncio' : 'Nuovo annuncio' }}</h2>
      <FormField id="atitle" label="Titolo" v-slot="{ describedBy }"><input id="atitle" v-model="f.title" class="input" :aria-describedby="describedBy"></FormField>
      <FormField id="abody" label="Testo" v-slot="{ describedBy }"><textarea id="abody" v-model="f.body" class="input" :aria-describedby="describedBy" /></FormField>
      <label class="check"><input v-model="f.pinned" type="checkbox"> In evidenza</label>
      <label class="check"><input v-model="f.publish" type="checkbox"> Pubblicato (se spento resta bozza)</label>
      <p v-if="error" class="notice bad" role="alert">{{ error }}</p>
      <div class="row-actions">
        <button class="btn btn-primary" type="submit" :disabled="busy">{{ f.id ? 'Salva' : 'Pubblica' }}</button>
        <button v-if="f.id" class="btn" type="button" @click="Object.assign(f, blank())">Annulla</button>
      </div>
    </form>

    <SkeletonBlock v-if="status === 'pending' && !data" size="lg" />
    <ul v-else-if="data?.length" class="list" aria-label="Annunci">
      <li v-for="a in data" :key="a.id" class="row">
        <div><p class="nm">{{ a.title }}</p><p class="muted sm">{{ a.published_at ? formatShortDay(a.published_at) : 'Bozza' }}<template v-if="a.pinned"> · in evidenza</template></p></div>
        <div class="row-actions">
          <button class="btn btn-sm" type="button" @click="edit(a)">Modifica</button>
          <button v-if="confirming !== a.id" class="btn btn-sm btn-danger" type="button" @click="confirming = a.id">Elimina</button>
          <button v-else class="btn btn-sm btn-danger" type="button" @click="remove(a.id)">Conferma</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.list { list-style: none; margin: var(--space-5) 0 0; padding: 0; display: grid; }
.row { display: grid; gap: var(--space-2); padding: var(--space-3) 0; border-bottom: 1px solid var(--rv-line); }
.nm { font-weight: var(--fw-ui); }
.sm { font-size: var(--fs-sm); }
@media (min-width: 701px) { .row { grid-template-columns: 1fr auto; align-items: center; } }
</style>
