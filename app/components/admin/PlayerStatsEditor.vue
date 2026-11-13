<script setup lang="ts">
import type { Database } from '~/types/database'

const props = defineProps<{ playerId: string }>()
const client = useSupabaseClient<Database>()
type Season = { id: string; name: string; is_current: boolean }
const seasons = ref<Season[]>([])
const seasonId = ref('')
const stats = reactive({ goals: 0, assists: 0, assists_many: false, appearances: 0 })
const busy = ref(false)
const message = ref<{ kind: 'ok' | 'bad'; text: string } | null>(null)

async function load() {
  const { data: seasonRows } = await client.from('seasons').select('id, name, is_current').order('starts_on', { ascending: false })
  seasons.value = seasonRows ?? []
  const season = seasons.value.find((s) => s.id === seasonId.value) ?? seasons.value.find((s) => s.is_current) ?? seasons.value[0]
  if (!season) return
  seasonId.value = season.id
  const { data } = await client.from('player_stat_baselines').select('goals, assists, assists_many, appearances')
    .eq('player_id', props.playerId).eq('season_id', season.id).maybeSingle()
  stats.goals = data?.goals ?? 0
  stats.assists = data?.assists ?? 0
  stats.assists_many = data?.assists_many ?? false
  stats.appearances = data?.appearances ?? 0
  message.value = null
}

const { status } = useAsyncData(`admin-player-baseline-${props.playerId}`, load, { lazy: true })
watch(seasonId, async (value, old) => { if (old && value !== old) await load() })

async function save() {
  message.value = null
  const values = [stats.goals, stats.assists, stats.appearances]
  if (values.some((value) => !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 32767)) {
    message.value = { kind: 'bad', text: 'Inserisci numeri interi da 0 a 32767.' }
    return
  }
  busy.value = true
  const { error } = await client.from('player_stat_baselines').upsert({
    player_id: props.playerId, season_id: seasonId.value, goals: Number(stats.goals), assists: Number(stats.assists),
    assists_many: stats.assists_many, appearances: Number(stats.appearances),
  }, { onConflict: 'player_id,season_id' })
  busy.value = false
  message.value = error
    ? { kind: 'bad', text: 'Non siamo riusciti a salvare le statistiche. Riprova.' }
    : { kind: 'ok', text: 'Statistiche salvate.' }
}
</script>

<template>
  <section class="panel editor" aria-labelledby="stats-title">
    <div class="heading"><div><p class="eyebrow">Dati sportivi</p><h2 id="stats-title" class="display">Statistiche</h2></div>
      <label v-if="seasons.length" class="season">Stagione
        <select v-model="seasonId" class="input"><option v-for="s in seasons" :key="s.id" :value="s.id">{{ s.name }}</option></select>
      </label>
    </div>
    <SkeletonBlock v-if="status === 'pending' && !seasons.length" size="sm" />
    <p v-else-if="!seasons.length" class="muted">Non ci sono stagioni da modificare.</p>
    <form v-else class="fields" @submit.prevent="save">
      <label>Presenze<input v-model.number="stats.appearances" class="input" type="number" min="0" max="32767" inputmode="numeric"></label>
      <label>Gol<input v-model.number="stats.goals" class="input" type="number" min="0" max="32767" inputmode="numeric"></label>
      <label>Assist<input v-model.number="stats.assists" class="input" type="number" min="0" max="32767" inputmode="numeric" :disabled="stats.assists_many"></label>
      <label class="check"><input v-model="stats.assists_many" type="checkbox"> Assist non quantificati</label>
      <p class="muted sm note">Si sommano alle statistiche ricavate dalle partite registrate.</p>
      <p v-if="message" class="notice" :class="message.kind" role="status">{{ message.text }}</p>
      <button class="btn btn-primary" type="submit" :disabled="busy">Salva statistiche</button>
    </form>
  </section>
</template>

<style scoped>
.editor { display: grid; gap: var(--space-3); margin-top: var(--space-5); }
.heading { display: flex; justify-content: space-between; align-items: end; gap: var(--space-3); }
h2 { margin: var(--space-1) 0 0; font-size: var(--fs-h2); }
.season { display: grid; gap: var(--space-1); font-size: var(--fs-sm); }
.fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-3); align-items: end; }
.fields > label:not(.check) { display: grid; gap: var(--space-1); font-size: var(--fs-sm); }
.check { grid-column: 1 / -1; }
.note { grid-column: 1 / -1; margin: 0; }
.fields .notice { grid-column: 1 / -1; margin: 0; }
@media (max-width: 600px) { .heading { align-items: start; flex-direction: column; } .fields { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
