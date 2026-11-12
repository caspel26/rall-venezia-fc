<script setup lang="ts">
import type { Database } from '~/types/database'
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Classifica · Admin' })
const client = useSupabaseClient<Database>()

interface Row { key: string; id: string | null; team: string; points: number; sort_order: number; is_us: boolean }
let n = 0
const key = () => `r${++n}`

const season = ref<{ id: string; name: string } | null>(null)
const rows = ref<Row[]>([])
const loaded = ref<Set<string>>(new Set())
const busy = ref(false)
const msg = ref<{ kind: 'ok' | 'bad'; text: string } | null>(null)
const pasted = ref('')

async function load() {
  const { data: s } = await client.from('seasons').select('id, name').eq('is_current', true).maybeSingle()
  season.value = s
  if (!s) return
  const { data } = await client.from('standings').select('*').eq('season_id', s.id)
  rows.value = rankStandings(data ?? []).map((r) => ({ key: key(), id: r.id, team: r.team, points: r.points, sort_order: r.sort_order, is_us: r.is_us }))
  loaded.value = new Set((data ?? []).map((r) => r.id))
}
const { status } = useAsyncData('admin-standings', async () => { await load(); return true }, { lazy: true })

// shown in table order: points first, then the manual order
const ranked = computed(() => rankStandings(rows.value.map((r) => ({ ...r }))).map((r) => ({ ...r, ref: rows.value.find((x) => x.key === r.key)! })))

function add() { rows.value.push({ key: key(), id: null, team: '', points: 0, sort_order: rows.value.length + 1, is_us: false }) }
function remove(r: Row) { rows.value = rows.value.filter((x) => x !== r) }
function setUs(r: Row) { rows.value.forEach((x) => (x.is_us = x === r && !x.is_us)) }

// moving a team up or down only matters among teams level on points (the tie-break is yours to decide)
function move(r: Row, dir: -1 | 1) {
  const group = ranked.value.filter((x) => x.points === r.points)
  const i = group.findIndex((x) => x.key === r.key)
  const other = group[i + dir]
  if (!other) return
  const a = r.sort_order
  r.sort_order = other.sort_order
  other.ref.sort_order = a
  if (r.sort_order === other.ref.sort_order) other.ref.sort_order += dir === -1 ? 1 : -1
}
const canMove = (r: Row, dir: -1 | 1) => { const g = ranked.value.filter((x) => x.points === r.points); const i = g.findIndex((x) => x.key === r.key); return !!g[i + dir] }

function replaceWithPasted() {
  const parsed = parseStandings(pasted.value)
  if (!parsed.length) { msg.value = { kind: 'bad', text: 'Non riesco a leggere la lista. Una squadra per riga, con i punti alla fine.' }; return }
  const hadUs = rows.value.find((x) => x.is_us)?.team.toLowerCase()
  // keep existing rows for teams that are still there, so nothing is deleted and re-created needlessly
  const byName = new Map(rows.value.map((r) => [r.team.toLowerCase(), r]))
  rows.value = parsed.map((p, i) => {
    const old = byName.get(p.team.toLowerCase())
    return { key: old?.key ?? key(), id: old?.id ?? null, team: p.team, points: p.points, sort_order: i + 1, is_us: p.team.toLowerCase() === (hadUs ?? 'venezia') }
  })
  pasted.value = ''
  msg.value = { kind: 'ok', text: `${parsed.length} squadre lette. Controlla e premi Salva.` }
}

async function save() {
  msg.value = null
  if (!season.value) return
  const teams = rows.value.map((r) => r.team.trim().toLowerCase())
  if (rows.value.some((r) => !r.team.trim())) { msg.value = { kind: 'bad', text: 'Ogni riga ha bisogno del nome della squadra.' }; return }
  if (new Set(teams).size !== teams.length) { msg.value = { kind: 'bad', text: 'Ci sono due squadre con lo stesso nome.' }; return }
  busy.value = true
  const sid = season.value.id
  const keepIds = new Set(rows.value.filter((r) => r.id).map((r) => r.id!))
  const removed = [...loaded.value].filter((id) => !keepIds.has(id))
  let err = false
  if (removed.length) err = !!(await client.from('standings').delete().in('id', removed)).error
  if (!err) err = !!(await client.from('standings').update({ is_us: false }).eq('season_id', sid)).error
  // renumber the manual order from what is on screen so ties keep the order you see
  const ordered = ranked.value
  if (!err) {
    const payload = ordered.map((r, i) => ({ id: r.id ?? crypto.randomUUID(), season_id: sid, team: r.team.trim(), points: Math.max(0, Math.round(Number(r.points) || 0)), sort_order: i + 1, is_us: r.is_us }))
    err = !!(await client.from('standings').upsert(payload, { onConflict: 'season_id,team' })).error
  }
  busy.value = false
  if (err) { msg.value = { kind: 'bad', text: 'Non siamo riusciti a salvare la classifica. Riprova.' }; return }
  await load()
  msg.value = { kind: 'ok', text: 'Classifica salvata.' }
}
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Admin" title="Classifica" :lead="season ? `Campionato ${season.name}. Cambia i punti: la tabella si riordina da sola.` : ''" />
    <AdminTabs />

    <SkeletonBlock v-if="status === 'pending' && !rows.length" size="hero" />
    <template v-else>
      <details class="panel paste">
        <summary class="eyebrow"><AppIcon name="list" :size="16" /> Incolla la classifica</summary>
        <p class="muted">Una squadra per riga, nell’ordine della tabella, con i punti alla fine (es. «1 Lazio 21»). Sostituisce la lista qui sotto.</p>
        <label class="sr-only" for="pasted">Classifica da incollare</label>
        <textarea id="pasted" v-model="pasted" class="input" rows="8" placeholder="1 Lazio 21&#10;2 Como 19&#10;3 Venezia 18" />
        <div class="row-actions"><button type="button" class="btn btn-sm" :disabled="!pasted.trim()" @click="replaceWithPasted">Leggi la lista</button></div>
      </details>

      <ul class="list" aria-label="Squadre">
        <li v-for="r in ranked" :key="r.key" class="row" :class="{ us: r.is_us }">
          <span class="pos display tabular">{{ r.position }}</span>
          <input v-model="r.ref.team" class="input team" :aria-label="`Nome della squadra in posizione ${r.position}`" placeholder="Squadra">
          <input v-model.number="r.ref.points" class="input pts tabular" type="number" min="0" inputmode="numeric" :aria-label="`Punti di ${r.team || 'squadra'}`">
          <div class="ctl">
            <button type="button" class="ic" :disabled="!canMove(r.ref, -1)" :aria-label="`Sposta ${r.team} su (a pari punti)`" @click="move(r.ref, -1)"><AppIcon name="arrow-left" :size="16" style="rotate: 90deg" /></button>
            <button type="button" class="ic" :disabled="!canMove(r.ref, 1)" :aria-label="`Sposta ${r.team} giù (a pari punti)`" @click="move(r.ref, 1)"><AppIcon name="arrow-left" :size="16" style="rotate: -90deg" /></button>
            <label class="check small"><input type="checkbox" :checked="r.is_us" @change="setUs(r.ref)"> Noi</label>
            <button type="button" class="btn btn-sm btn-danger" :aria-label="`Rimuovi ${r.team}`" @click="remove(r.ref)">✕</button>
          </div>
        </li>
      </ul>

      <p v-if="msg" class="notice" :class="msg.kind" role="status">{{ msg.text }}</p>
      <div class="savebar row-actions">
        <button type="button" class="btn" @click="add">+ Aggiungi squadra</button>
        <button type="button" class="btn btn-primary" :disabled="busy" @click="save">Salva la classifica</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.paste { display: grid; gap: var(--space-3); margin-bottom: var(--space-5); }
.paste summary { cursor: pointer; display: flex; align-items: center; gap: 8px; min-height: 44px; }
.list { list-style: none; margin: 0 0 var(--space-4); padding: 0; display: grid; gap: 8px; }
.row { display: grid; grid-template-columns: 32px 1fr 88px; gap: 10px; align-items: center; padding: 8px 12px; border-radius: 12px; background: var(--rv-surface-2); box-shadow: inset 0 0 0 1px var(--rv-line); }
.row.us { box-shadow: inset 0 0 0 1px var(--rv-orange-line); background: linear-gradient(90deg, var(--rv-orange-soft), var(--rv-surface-2) 80%); }
.pos { color: var(--rv-muted); font-size: 20px; text-align: center; }
.team { min-height: 44px; }
.pts { text-align: center; min-height: 44px; }
.ctl { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; justify-content: flex-end; }
.ic { width: 40px; height: 40px; border-radius: var(--r-s); border: 1px solid var(--rv-line-strong); background: var(--rv-surface-3); color: var(--rv-cream); display: grid; place-items: center; cursor: pointer; }
.ic:disabled { opacity: .35; cursor: default; }
.small { font-size: var(--fs-sm); color: var(--rv-muted); }
.savebar { position: sticky; bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + var(--space-2)); z-index: 5; padding: var(--space-2) 0; }
@media (min-width: 701px) { .row { grid-template-columns: 32px 1fr 96px auto; } .ctl { grid-column: auto; } }
@media (min-width: 1051px) { .savebar { bottom: var(--space-4); } }
</style>
