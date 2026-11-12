<script setup lang="ts">
import type { Database } from '~/types/database'
import type { MatchRow } from '~/types/domain'

const props = defineProps<{ match?: MatchRow | null }>()
const emit = defineEmits<{ saved: [id: string] }>()

const client = useSupabaseClient<Database>()
const { data: options, refresh } = useMatchOptions()

const f = reactive({
  season: props.match?.season_id ?? '',
  competition: props.match?.competition_id ?? '',
  opponent: props.match?.opponent_id ?? '',
  newOpponent: '',
  newCompetition: '',
  newSeason: '',
  isHome: props.match?.is_home ?? true,
  kickoff: props.match ? isoToRomeLocal(props.match.kickoff_at) : '',
  venue: props.match?.venue ?? '',
  status: props.match?.status ?? 'scheduled',
  notes: props.match?.notes ?? '',
  published: props.match?.published ?? true,
})
const busy = ref(false)
const error = ref('')

watch(options, (o) => {
  if (o && !f.season) f.season = o.seasons.find((s) => s.is_current)?.id ?? o.seasons[0]?.id ?? ''
}, { immediate: true })

const STATUSES = [
  ['scheduled', 'In programma'], ['completed', 'Giocata'], ['postponed', 'Rinviata'], ['cancelled', 'Annullata'],
] as const

async function createOpponent(name: string) {
  const { data, error: e } = await client.from('opponents').insert({ name }).select('id').single()
  if (e) throw e
  return data.id
}
async function createCompetition(name: string) {
  const { data, error: e } = await client.from('competitions').insert({ name }).select('id').single()
  if (e) throw e
  return data.id
}

async function submit() {
  error.value = ''
  if (!f.kickoff) { error.value = 'Inserisci data e ora.'; return }
  if (!f.opponent && !f.newOpponent.trim()) { error.value = 'Scegli l’avversario.'; return }
  busy.value = true
  try {
    const opponent_id = f.newOpponent.trim() ? await createOpponent(f.newOpponent.trim()) : f.opponent
    const competition_id = f.newCompetition.trim() ? await createCompetition(f.newCompetition.trim()) : f.competition || null
    let season_id = f.season
    if (f.newSeason.trim()) {
      const year = new Date().getFullYear()
      const { data, error: e } = await client.from('seasons')
        .insert({ name: f.newSeason.trim(), starts_on: `${year}-09-01` }).select('id').single()
      if (e) throw e
      season_id = data.id
    }
    if (!season_id) { error.value = 'Scegli la stagione.'; busy.value = false; return }
    const row = {
      season_id, competition_id, opponent_id, is_home: f.isHome, kickoff_at: romeLocalToIso(f.kickoff),
      venue: f.venue.trim() || null, notes: f.notes.trim() || null, published: f.published,
      // a match can only be "completed" through the result flow, which sets the score
      status: f.status === 'completed' && !props.match?.rv_score && props.match?.rv_score !== 0 ? 'scheduled' : f.status,
    }
    const q = props.match
      ? client.from('matches').update(row).eq('id', props.match.id).select('id').single()
      : client.from('matches').insert(row).select('id').single()
    const { data, error: e } = await q
    if (e) throw e
    await refresh()
    emit('saved', data.id)
  } catch (e) {
    error.value = 'Non siamo riusciti a salvare la partita. Controlla i dati e riprova.'
    console.error(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="form-grid" novalidate @submit.prevent="submit">
    <FormField id="opp" label="Avversario" v-slot="{ describedBy }">
      <select id="opp" v-model="f.opponent" class="input" :aria-describedby="describedBy">
        <option value="">Scegli…</option>
        <option v-for="o in options?.opponents" :key="o.id" :value="o.id">{{ o.name }}</option>
      </select>
    </FormField>
    <FormField id="newopp" label="…oppure nuovo avversario" v-slot="{ describedBy }">
      <input id="newopp" v-model="f.newOpponent" class="input" type="text" :aria-describedby="describedBy">
    </FormField>
    <FormField id="ko" label="Data e ora del calcio d’inizio" v-slot="{ describedBy }">
      <input id="ko" v-model="f.kickoff" class="input" type="datetime-local" required :aria-describedby="describedBy">
    </FormField>
    <FormField id="venue" label="Luogo" v-slot="{ describedBy }">
      <input id="venue" v-model="f.venue" class="input" type="text" :aria-describedby="describedBy">
    </FormField>
    <label class="check"><input v-model="f.isHome" type="checkbox"> Si gioca in casa</label>
    <FormField id="comp" label="Competizione" v-slot="{ describedBy }">
      <select id="comp" v-model="f.competition" class="input" :aria-describedby="describedBy">
        <option value="">Nessuna</option>
        <option v-for="c in options?.competitions" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </FormField>
    <FormField id="newcomp" label="…oppure nuova competizione" v-slot="{ describedBy }">
      <input id="newcomp" v-model="f.newCompetition" class="input" type="text" :aria-describedby="describedBy">
    </FormField>
    <FormField id="season" label="Stagione" v-slot="{ describedBy }">
      <select id="season" v-model="f.season" class="input" :aria-describedby="describedBy">
        <option v-for="s in options?.seasons" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </FormField>
    <FormField id="newseason" label="…oppure nuova stagione (es. 2027/28)" v-slot="{ describedBy }">
      <input id="newseason" v-model="f.newSeason" class="input" type="text" :aria-describedby="describedBy">
    </FormField>
    <FormField v-if="match" id="status" label="Stato" v-slot="{ describedBy }">
      <select id="status" v-model="f.status" class="input" :aria-describedby="describedBy">
        <option v-for="[v, l] in STATUSES" :key="v" :value="v">{{ l }}</option>
      </select>
    </FormField>
    <FormField id="notes" label="Note" v-slot="{ describedBy }">
      <textarea id="notes" v-model="f.notes" class="input" :aria-describedby="describedBy" />
    </FormField>
    <label class="check"><input v-model="f.published" type="checkbox"> Visibile ai giocatori</label>
    <p v-if="error" class="notice bad" role="alert">{{ error }}</p>
    <div class="row-actions">
      <button class="btn btn-primary" type="submit" :disabled="busy">{{ match ? 'Salva' : 'Crea partita' }}</button>
      <slot />
    </div>
  </form>
</template>
