<script setup lang="ts">
import type { Database } from '~/types/database'
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Gazzetta · Admin' })
const client = useSupabaseClient<Database>()

const { data, refresh, status } = useAsyncData('admin-news', async () => {
  const [articles, matches] = await Promise.all([
    client.from('news_articles').select('*').order('created_at', { ascending: false }),
    client.from('matches').select('id, kickoff_at, opponent:opponents(name)').order('kickoff_at', { ascending: false }).limit(30),
  ])
  return { articles: articles.data ?? [], matches: matches.data ?? [] }
}, { lazy: true })

const blank = () => ({ id: '', kicker: '', title: '', summary: '', body: '', match: '', lead: false, publish: true })
const f = reactive(blank())
const error = ref('')
const busy = ref(false)

function edit(a: NonNullable<typeof data.value>['articles'][number]) {
  Object.assign(f, { id: a.id, kicker: a.kicker ?? '', title: a.title, summary: a.summary ?? '', body: a.body, match: a.match_id ?? '', lead: a.is_lead, publish: !!a.published_at })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
async function save() {
  error.value = ''
  if (!f.title.trim() || !f.body.trim()) { error.value = 'Titolo e testo sono obbligatori.'; return }
  busy.value = true
  const existing = data.value?.articles.find((a) => a.id === f.id)
  if (f.lead) await client.from('news_articles').update({ is_lead: false }).eq('is_lead', true).neq('id', f.id || '00000000-0000-0000-0000-000000000000')
  const row = {
    kicker: f.kicker.trim() || null, title: f.title.trim(), summary: f.summary.trim() || null, body: f.body.trim(),
    match_id: f.match || null, is_lead: f.lead, published_at: f.publish ? (existing?.published_at ?? new Date().toISOString()) : null,
  }
  const { error: e } = f.id
    ? await client.from('news_articles').update(row).eq('id', f.id)
    : await client.from('news_articles').insert({ ...row, slug: `${slugify(f.title).slice(0, 60)}-${Date.now().toString(36)}` })
  busy.value = false
  if (e) { error.value = 'Non siamo riusciti a salvare l’articolo.'; return }
  Object.assign(f, blank())
  await refresh()
}
// Instagram posts are hidden, not deleted: the row stays so the next sync does not import it again.
async function hide(id: string) {
  await client.from('news_articles').update({ published_at: null, is_lead: false }).eq('id', id)
  await refresh()
}
const confirming = ref('')
async function remove(id: string) {
  await client.from('news_articles').delete().eq('id', id)
  confirming.value = ''
  await refresh()
}
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Admin" title="Gazzetta" lead="Testo semplice: una riga vuota separa i paragrafi." />
    <AdminTabs />
    <form class="form-grid panel" novalidate @submit.prevent="save">
      <h2 class="eyebrow">{{ f.id ? 'Modifica articolo' : 'Nuovo articolo' }}</h2>
      <FormField id="nk" label="Occhiello" hint="La riga piccola sopra il titolo." v-slot="{ describedBy }"><input id="nk" v-model="f.kicker" class="input" :aria-describedby="describedBy"></FormField>
      <FormField id="nt" label="Titolo" v-slot="{ describedBy }"><input id="nt" v-model="f.title" class="input" :aria-describedby="describedBy"></FormField>
      <FormField id="ns" label="Sommario" v-slot="{ describedBy }"><textarea id="ns" v-model="f.summary" class="input" rows="2" :aria-describedby="describedBy" /></FormField>
      <FormField id="nb" label="Testo" v-slot="{ describedBy }"><textarea id="nb" v-model="f.body" class="input tall" :aria-describedby="describedBy" /></FormField>
      <FormField id="nm" label="Partita collegata" v-slot="{ describedBy }">
        <select id="nm" v-model="f.match" class="input" :aria-describedby="describedBy">
          <option value="">Nessuna</option>
          <option v-for="m in data?.matches" :key="m.id" :value="m.id">{{ m.opponent?.name }} · {{ formatShortDay(m.kickoff_at) }}</option>
        </select>
      </FormField>
      <label class="check"><input v-model="f.lead" type="checkbox"> Apertura in prima pagina</label>
      <label class="check"><input v-model="f.publish" type="checkbox"> Pubblicato (se spento resta bozza)</label>
      <p v-if="error" class="notice bad" role="alert">{{ error }}</p>
      <div class="row-actions">
        <button class="btn btn-primary" type="submit" :disabled="busy">{{ f.id ? 'Salva' : 'Pubblica' }}</button>
        <button v-if="f.id" class="btn" type="button" @click="Object.assign(f, blank())">Annulla</button>
      </div>
    </form>

    <SkeletonBlock v-if="status === 'pending' && !data" size="lg" />
    <ul v-else-if="data?.articles.length" class="list" aria-label="Articoli">
      <li v-for="a in data.articles" :key="a.id" class="row">
        <div><p class="nm">{{ a.title }}</p><p class="muted sm">{{ a.published_at ? formatShortDay(a.published_at) : 'Bozza' }}<template v-if="a.is_lead"> · apertura</template><template v-if="a.source === 'instagram'"> · Instagram</template></p></div>
        <div class="row-actions">
          <NuxtLink v-if="a.published_at" :to="`/news/${a.slug}`" class="btn btn-sm">Leggi</NuxtLink>
          <button class="btn btn-sm" type="button" @click="edit(a)">Modifica</button>
          <template v-if="a.source === 'instagram'">
            <button v-if="a.published_at" class="btn btn-sm btn-danger" type="button" @click="hide(a.id)">Nascondi</button>
            <span v-else class="muted sm">nascosto (Instagram)</span>
          </template>
          <template v-else>
            <button v-if="confirming !== a.id" class="btn btn-sm btn-danger" type="button" @click="confirming = a.id">Elimina</button>
            <button v-else class="btn btn-sm btn-danger" type="button" @click="remove(a.id)">Conferma</button>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tall { min-height: 220px; }
.list { list-style: none; margin: var(--space-5) 0 0; padding: 0; display: grid; }
.row { display: grid; gap: var(--space-2); padding: var(--space-3) 0; border-bottom: 1px solid var(--rv-line); }
.nm { font-weight: var(--fw-ui); }
.sm { font-size: var(--fs-sm); }
@media (min-width: 701px) { .row { grid-template-columns: 1fr auto; align-items: center; } }
</style>
