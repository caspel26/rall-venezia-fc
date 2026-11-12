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

const blank = () => ({ id: '', cover: '', kicker: '', title: '', summary: '', body: '', match: '', lead: false, publish: true })
const f = reactive(blank())
const error = ref('')
const busy = ref(false)

function edit(a: NonNullable<typeof data.value>['articles'][number]) {
  Object.assign(f, { id: a.id, cover: a.cover_path ?? '', kicker: a.kicker ?? '', title: a.title, summary: a.summary ?? '', body: a.body, match: a.match_id ?? '', lead: a.is_lead, publish: !!a.published_at })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
// A "SCHEDA SITO" block written by a chat assistant fills the form in one paste.
const pasteBlock = ref('')
const pasteNote = ref('')
function fillFromBlock() {
  const b = parseNewsBlock(pasteBlock.value)
  if (!b.title && !b.body) { pasteNote.value = 'Non trovo titolo e testo. Incolla la scheda intera (con TITOLO: e TESTO:).'; return }
  Object.assign(f, { kicker: b.kicker || f.kicker, title: b.title || f.title, summary: b.summary || f.summary, body: b.body || f.body })
  const want = b.match.toLowerCase()
  const hit = want ? data.value?.matches.find((m) => (m.opponent?.name ?? '').toLowerCase().includes(want) || want.includes((m.opponent?.name ?? '').toLowerCase())) : null
  if (hit) f.match = hit.id
  pasteNote.value = `Compilato${hit ? ' e collegato alla partita' : ''}. Controlla, aggiungi la foto e pubblica.`
  pasteBlock.value = ''
}

// Photos are shrunk in the browser (max 1600px, JPEG) before they go to the private `graphics` bucket.
const photoBusy = ref(false)
const photoError = ref('')
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.86))
}
async function pickPhoto(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  photoError.value = ''
  if (!file.type.startsWith('image/') || file.size > 25 * 1024 * 1024) { photoError.value = 'Scegli un’immagine (JPG, PNG o WebP) fino a 25 MB.'; return }
  photoBusy.value = true
  try {
    const blob = await shrink(file)
    const path = `news/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.jpg`
    const { error: e2 } = await client.storage.from('graphics').upload(path, blob, { contentType: 'image/jpeg' })
    if (e2) throw e2
    f.cover = path
  } catch { photoError.value = 'Caricamento della foto non riuscito. Riprova.' }
  photoBusy.value = false
  input.value = ''
}

async function save() {
  error.value = ''
  if (!f.title.trim() || !f.body.trim()) { error.value = 'Titolo e testo sono obbligatori.'; return }
  busy.value = true
  const existing = data.value?.articles.find((a) => a.id === f.id)
  if (f.lead) await client.from('news_articles').update({ is_lead: false }).eq('is_lead', true).neq('id', f.id || '00000000-0000-0000-0000-000000000000')
  const row = {
    cover_path: f.cover || null, kicker: f.kicker.trim() || null, title: f.title.trim(), summary: f.summary.trim() || null, body: f.body.trim(),
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
      <details v-if="!f.id" class="paste">
        <summary class="eyebrow"><AppIcon name="news" :size="16" /> Incolla la scheda da ChatGPT</summary>
        <label class="sr-only" for="blk">Scheda sito</label>
        <textarea id="blk" v-model="pasteBlock" class="input" rows="7" placeholder="CATEGORIA: partita&#10;OCCHIELLO: …&#10;TITOLO: …&#10;SOMMARIO: …&#10;PARTITA: Monza&#10;TESTO:&#10;…" />
        <div class="row-actions"><button type="button" class="btn btn-sm" :disabled="!pasteBlock.trim()" @click="fillFromBlock">Compila il modulo</button></div>
        <p v-if="pasteNote" class="muted" role="status">{{ pasteNote }}</p>
      </details>
      <FormField id="nk" label="Occhiello" hint="La riga piccola sopra il titolo." v-slot="{ describedBy }"><input id="nk" v-model="f.kicker" class="input" :aria-describedby="describedBy"></FormField>
      <div class="photo">
        <FormField id="np" label="Foto di copertina" hint="Facoltativa. JPG, PNG o WebP: viene ridimensionata da sola." v-slot="{ describedBy }">
          <input id="np" class="input" type="file" accept="image/*" :disabled="photoBusy" :aria-describedby="describedBy" @change="pickPhoto">
        </FormField>
        <p v-if="photoError" class="notice bad" role="alert">{{ photoError }}</p>
        <div v-if="f.cover" class="preview">
          <NewsCover :path="f.cover" alt="Anteprima della copertina" />
          <button type="button" class="btn btn-sm btn-danger" @click="f.cover = ''">Rimuovi foto</button>
        </div>
      </div>
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
    <TransitionGroup v-else-if="data?.articles.length" tag="ul" name="vlist" class="list" aria-label="Articoli">
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
    </TransitionGroup>
  </div>
</template>

<style scoped>
.tall { min-height: 220px; }
.paste { display: grid; gap: var(--space-2); padding: var(--space-3) var(--space-4); border-radius: 12px; background: var(--rv-surface-2); box-shadow: inset 0 0 0 1px var(--rv-line); }
.paste summary { cursor: pointer; display: flex; align-items: center; gap: 8px; min-height: 44px; }
.photo { display: grid; gap: var(--space-3); }
.preview { display: grid; gap: var(--space-2); justify-items: start; max-width: 420px; }
.preview :deep(.cover) { width: 100%; border-radius: var(--r-card); }
.list { position: relative; list-style: none; margin: var(--space-5) 0 0; padding: 0; display: grid; }
.row { display: grid; gap: var(--space-2); padding: var(--space-3) 0; border-bottom: 1px solid var(--rv-line); }
.nm { font-weight: var(--fw-ui); }
.sm { font-size: var(--fs-sm); }
@media (min-width: 701px) { .row { grid-template-columns: 1fr auto; align-items: center; } }
</style>
