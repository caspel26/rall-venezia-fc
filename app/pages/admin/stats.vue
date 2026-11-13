<script setup lang="ts">
import type { Database } from '~/types/database'
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Statistiche · Admin' })
const client = useSupabaseClient<Database>()

type Season = { id: string; name: string; is_current: boolean }
type Row = { player_id: string; first_name: string; last_name: string; shirt_number: number | null; goals: number; assists: number; assists_many: boolean; appearances: number }
const seasons = ref<Season[]>([])
const seasonId = ref('')
const rows = ref<Row[]>([])
const busy = ref(false)
const msg = ref<{ kind: 'ok' | 'bad'; text: string } | null>(null)

async function load() {
  const [seasonResult, playersResult] = await Promise.all([
    client.from('seasons').select('id, name, is_current').order('starts_on', { ascending: false }),
    client.from('players').select('id, first_name, last_name, shirt_number').order('last_name'),
  ])
  seasons.value = seasonResult.data ?? []
  const current = seasonResult.data?.find((s) => s.id === seasonId.value) ?? seasonResult.data?.find((s) => s.is_current) ?? seasonResult.data?.[0]
  if (current) seasonId.value = current.id
  const baselineResult = current
    ? await client.from('player_stat_baselines').select('*').eq('season_id', current.id)
    : { data: [] }
  const baselineByPlayer = new Map((baselineResult.data ?? []).map((b) => [b.player_id, b]))
  rows.value = (playersResult.data ?? []).map((p) => {
    const b = baselineByPlayer.get(p.id)
    return { player_id: p.id, first_name: p.first_name, last_name: p.last_name, shirt_number: p.shirt_number,
      goals: b?.goals ?? 0, assists: b?.assists ?? 0, assists_many: b?.assists_many ?? false, appearances: b?.appearances ?? 0 }
  })
}

const { status } = useAsyncData('admin-player-stats', load, { lazy: true })
watch(seasonId, async (value, old) => { if (old && value !== old) await load() })

async function save() {
  msg.value = null
  if (!seasonId.value) return
  if (rows.value.some((r) => [r.goals, r.assists, r.appearances].some((n) => !Number.isInteger(Number(n)) || Number(n) < 0 || Number(n) > 32767))) {
    msg.value = { kind: 'bad', text: 'Inserisci valori interi da 0 a 32767.' }
    return
  }
  busy.value = true
  const { error } = await client.from('player_stat_baselines').upsert(rows.value.map((r) => ({
    player_id: r.player_id, season_id: seasonId.value, goals: Number(r.goals), assists: Number(r.assists),
    assists_many: r.assists_many, appearances: Number(r.appearances),
  })), { onConflict: 'player_id,season_id' })
  busy.value = false
  msg.value = error
    ? { kind: 'bad', text: 'Non siamo riusciti a salvare le statistiche. Riprova.' }
    : { kind: 'ok', text: 'Statistiche salvate.' }
}
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Admin" title="Statistiche giocatori" lead="Correggi i totali storici della stagione, prima della registrazione partita per partita." />
    <AdminTabs />
    <SkeletonBlock v-if="status === 'pending' && !rows.length" size="hero" />
    <template v-else>
      <label class="season">Stagione
        <select v-model="seasonId" class="input"><option v-for="s in seasons" :key="s.id" :value="s.id">{{ s.name }}</option></select>
      </label>
      <p v-if="!seasons.length" class="notice">Non ci sono stagioni da modificare.</p>
      <form v-else class="flow" @submit.prevent="save">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Giocatore</th><th>Presenze</th><th>Gol</th><th>Assist</th><th>Assist</th></tr></thead>
            <tbody>
              <tr v-for="r in rows" :key="r.player_id">
                <th scope="row"><span v-if="r.shirt_number != null" class="number">{{ r.shirt_number }}</span>{{ r.first_name }} {{ r.last_name }}</th>
                <td><input v-model.number="r.appearances" class="input numeric" type="number" min="0" max="32767" :aria-label="`Presenze ${r.first_name} ${r.last_name}`"></td>
                <td><input v-model.number="r.goals" class="input numeric" type="number" min="0" max="32767" :aria-label="`Gol ${r.first_name} ${r.last_name}`"></td>
                <td><input v-model.number="r.assists" class="input numeric" type="number" min="0" max="32767" :aria-label="`Assist ${r.first_name} ${r.last_name}`" :disabled="r.assists_many"></td>
                <td><label class="check"><input v-model="r.assists_many" type="checkbox" :aria-label="`Assist non quantificati ${r.first_name} ${r.last_name}`"> Tanti</label></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="muted sm">Questi valori si sommano alle statistiche ricavate dalle partite registrate.</p>
        <p v-if="msg" class="notice" :class="msg.kind" role="status">{{ msg.text }}</p>
        <div class="savebar"><button class="btn btn-primary" type="submit" :disabled="busy">Salva statistiche</button></div>
      </form>
    </template>
  </div>
</template>

<style scoped>
.season { display: grid; gap: var(--space-2); max-width: 320px; margin-bottom: var(--space-4); font-weight: var(--fw-ui); }
.flow { display: grid; gap: var(--space-3); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: var(--space-2); border-bottom: 1px solid var(--rv-line); text-align: left; }
thead th { color: var(--rv-muted); font-size: var(--fs-sm); }
tbody th { min-width: 180px; font-weight: var(--fw-ui); white-space: nowrap; }
.number { display: inline-block; width: 28px; margin-right: var(--space-2); color: var(--rv-orange); text-align: right; }
.numeric { width: 76px; text-align: center; }
.check { white-space: nowrap; font-size: var(--fs-sm); }
.savebar { position: sticky; bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + var(--space-2)); z-index: 5; background: var(--rv-bg); padding: var(--space-2) 0; }
@media (min-width: 1051px) { .savebar { bottom: var(--space-4); } }
</style>
