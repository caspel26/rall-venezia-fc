<script setup lang="ts">
import type { Database } from '~/types/database'
import { hasRole, type PlayerRow } from '~/types/domain'

const props = defineProps<{ player?: PlayerRow | null }>()
const emit = defineEmits<{ saved: [] }>()

const client = useSupabaseClient<Database>()
const { role } = useAuth()
const isAdmin = computed(() => hasRole(role.value, ['admin']))

const f = reactive({
  first: props.player?.first_name ?? '',
  last: props.player?.last_name ?? '',
  slug: props.player?.slug ?? '',
  nickname: props.player?.nickname ?? '',
  number: props.player?.shirt_number == null ? '' : String(props.player.shirt_number),
  position: props.player?.position ?? '',
  captain: props.player?.is_captain ?? false,
  active: props.player?.is_active ?? true,
  bio: props.player?.bio ?? '',
  profile: props.player?.profile_id ?? '',
  photoPath: props.player?.photo_path ?? '',
})
const slugTouched = ref(!!props.player)
watch(() => [f.first, f.last], () => { if (!slugTouched.value) f.slug = slugify(f.first, f.last) })

const { data: profiles } = useAsyncData('link-profiles', async () => {
  if (!isAdmin.value) return []
  const [p, taken] = await Promise.all([
    client.from('profiles').select('id, email, display_name').order('email'),
    client.from('players').select('profile_id').not('profile_id', 'is', null),
  ])
  const used = new Set((taken.data ?? []).map((x) => x.profile_id))
  return (p.data ?? []).filter((x) => !used.has(x.id) || x.id === props.player?.profile_id)
}, { lazy: true })

const photoUrl = usePhotoUrl('player-photos', toRef(f, 'photoPath'))
const busy = ref(false)
const error = ref('')

const POSITIONS = Object.entries(POSITION_LABELS)

async function upload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
    error.value = 'Scegli un’immagine fino a 5 MB.'
    return
  }
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${f.slug || 'player'}/${Date.now()}.${ext}`
  const { error: e2 } = await client.storage.from('player-photos').upload(path, file, { contentType: file.type })
  if (e2) { error.value = 'Caricamento foto non riuscito.'; return }
  f.photoPath = path
  error.value = ''
}

async function submit() {
  error.value = ''
  if (!f.first.trim() || !f.last.trim()) { error.value = 'Nome e cognome sono obbligatori.'; return }
  const number = f.number === '' ? null : Number(f.number)
  if (number != null && (!Number.isInteger(number) || number < 0 || number > 99)) { error.value = 'Il numero va da 0 a 99.'; return }
  busy.value = true
  const row = {
    first_name: f.first.trim(), last_name: f.last.trim(), slug: f.slug || slugify(f.first, f.last),
    nickname: f.nickname.trim() || null, shirt_number: number, position: f.position || null,
    is_captain: f.captain, is_active: f.active, bio: f.bio.trim() || null,
    photo_path: f.photoPath || null, avatar_path: f.photoPath || null,
    ...(isAdmin.value ? { profile_id: f.profile || null } : {}),
  }
  const { error: e } = props.player
    ? await client.from('players').update(row).eq('id', props.player.id)
    : await client.from('players').insert(row)
  busy.value = false
  if (e) {
    error.value = /players_active_number/.test(e.message) ? 'Questo numero è già di un altro giocatore attivo.'
      : /players_one_captain/.test(e.message) ? 'C’è già un capitano: toglilo prima all’altro giocatore.'
      : /slug/.test(e.message) ? 'Esiste già un giocatore con questo indirizzo.' : 'Non siamo riusciti a salvare il giocatore.'
    return
  }
  emit('saved')
}
</script>

<template>
  <form class="form-grid" novalidate @submit.prevent="submit">
    <FormField id="first" label="Nome" v-slot="{ describedBy }"><input id="first" v-model="f.first" class="input" required :aria-describedby="describedBy"></FormField>
    <FormField id="last" label="Cognome" v-slot="{ describedBy }"><input id="last" v-model="f.last" class="input" required :aria-describedby="describedBy"></FormField>
    <FormField id="nick" label="Soprannome" v-slot="{ describedBy }"><input id="nick" v-model="f.nickname" class="input" :aria-describedby="describedBy"></FormField>
    <FormField id="num" label="Numero di maglia" hint="Lascia vuoto se non è ancora stato scelto." v-slot="{ describedBy }">
      <input id="num" v-model="f.number" class="input" type="number" inputmode="numeric" min="0" max="99" :aria-describedby="describedBy">
    </FormField>
    <FormField id="pos" label="Ruolo" v-slot="{ describedBy }">
      <select id="pos" v-model="f.position" class="input" :aria-describedby="describedBy">
        <option value="">Non definito</option>
        <option v-for="[v, l] in POSITIONS" :key="v" :value="v">{{ l }}</option>
      </select>
    </FormField>
    <FormField id="slug" label="Indirizzo del profilo" hint="Usato in /team/…" v-slot="{ describedBy }">
      <input id="slug" v-model="f.slug" class="input" :aria-describedby="describedBy" @input="slugTouched = true">
    </FormField>
    <FormField id="bio" label="Bio" v-slot="{ describedBy }"><textarea id="bio" v-model="f.bio" class="input" :aria-describedby="describedBy" /></FormField>
    <FormField id="photo" label="Foto" hint="Verticale, fino a 5 MB." v-slot="{ describedBy }">
      <input id="photo" class="input" type="file" accept="image/*" :aria-describedby="describedBy" @change="upload">
    </FormField>
    <img v-if="photoUrl" :src="photoUrl" alt="Anteprima foto" class="preview" width="160" height="200">
    <FormField v-if="isAdmin" id="acct" label="Account collegato" v-slot="{ describedBy }">
      <select id="acct" v-model="f.profile" class="input" :aria-describedby="describedBy">
        <option value="">Nessuno</option>
        <option v-for="p in profiles" :key="p.id" :value="p.id">{{ p.display_name ? `${p.display_name} · ` : '' }}{{ p.email }}</option>
      </select>
    </FormField>
    <label class="check"><input v-model="f.captain" type="checkbox"> Capitano</label>
    <label class="check"><input v-model="f.active" type="checkbox"> In rosa (attivo)</label>
    <p v-if="error" class="notice bad" role="alert">{{ error }}</p>
    <div class="row-actions">
      <button class="btn btn-primary" type="submit" :disabled="busy">{{ player ? 'Salva' : 'Aggiungi giocatore' }}</button>
      <slot />
    </div>
  </form>
</template>

<style scoped>
.preview { width: 160px; height: 200px; object-fit: cover; border-radius: var(--r-card); border: 1px solid var(--rv-line); }
</style>
