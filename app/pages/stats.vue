<script setup lang="ts">
import { hasRole, TEAM_ROLES } from '~/types/domain'
import { rankBy } from '~/utils/ranking'

useHead({ title: 'Stats · Rall Venezia' })
const { role } = useAuth()
const season = ref('')
const { data, status, rows, team } = useStats(season)
const tab = ref('team')

// default to the current season once the list is known
watch(() => data.value?.seasons, (list) => {
  if (list && !season.value) season.value = list.find((s) => s.is_current)?.id ?? ''
}, { immediate: true })

const canRate = computed(() => hasRole(role.value, TEAM_ROLES))
const tabs = [
  { key: 'team', label: 'Squadra' },
  { key: 'rankings', label: 'Classifiche' },
  { key: 'players', label: 'Giocatori' },
]
const fmt = (n: number | null) => (n == null ? '–' : formatRating(n))

const rankings = computed(() => [
  { title: 'Marcatori', rows: rankBy(rows.value, (r) => r.goals), unit: 'gol' },
  { title: 'Assist', rows: rankBy(rows.value, (r) => r.assists), unit: 'assist' },
  { title: 'MVP', rows: rankBy(rows.value, (r) => r.mvps), unit: 'MVP' },
  ...(canRate.value ? [{ title: 'Voto medio', rows: rankBy(rows.value, (r) => r.avgRating), unit: 'voto', rating: true }] : []),
  { title: 'Presenze', rows: rankBy(rows.value, (r) => r.appearances), unit: 'presenze' },
])
const table = computed(() => [...rows.value].sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name, 'it')))
const diff = computed(() => (team.value ? team.value.gf - team.value.ga : 0))
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Numeri" title="Stats" lead="Classifiche e statistiche di squadra." />

    <div class="bar">
      <Segmented v-model="tab" :items="tabs" label="Sezioni delle statistiche" />
      <select v-model="season" class="input sel" aria-label="Stagione">
        <option value="">Sempre</option>
        <option v-for="s in data?.seasons" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>

    <Transition name="vanish" mode="out-in">
    <div v-if="status === 'pending' && !data" key="s" class="skel"><SkeletonBlock size="lg" /><SkeletonBlock size="lg" /></div>

    <div v-else key="c">
      <section v-if="tab === 'team'" role="tabpanel" aria-labelledby="tab-team">
        <div v-if="team" class="team">
          <div v-reveal="0" class="panel"><StatCard label="Giocate" :value="team.played" /></div>
          <div v-reveal="1" class="panel"><StatCard label="Vinte" :value="team.wins" /></div>
          <div v-reveal="2" class="panel"><StatCard label="Pareggiate" :value="team.draws" /></div>
          <div v-reveal="3" class="panel"><StatCard label="Perse" :value="team.losses" /></div>
          <div v-reveal="4" class="panel"><StatCard label="Gol fatti" :value="team.gf" /></div>
          <div v-reveal="5" class="panel"><StatCard label="Gol subiti" :value="team.ga" /></div>
          <div v-reveal="5" class="panel wide"><StatCard label="Differenza reti" :value="diff > 0 ? `+${diff}` : String(diff)" /></div>
        </div>
        <EmptyState v-else title="Nessuna partita giocata" text="I numeri partono dalla prima partita." />
      </section>

      <section v-else-if="tab === 'rankings'" role="tabpanel" aria-labelledby="tab-rankings" class="ranks">
        <div v-for="(r, i) in rankings" :key="r.title" v-reveal="i % 4" class="panel">
          <h2 class="eyebrow">{{ r.title }}</h2>
          <ol v-if="r.rows.length" class="list">
            <RankingRow v-for="x in r.rows" :key="x.row.id" :position="x.position" :name="x.row.name" :slug="x.row.slug"
              :value="r.rating ? formatRating(x.value) : x.value" />
          </ol>
          <p v-else class="muted">Ancora nessun dato.</p>
        </div>
      </section>

      <section v-else role="tabpanel" aria-labelledby="tab-players">
        <div v-if="table.length" class="panel table-wrap">
          <table>
            <thead><tr><th>Giocatore</th><th>Pres.</th><th>Gol</th><th>Assist</th><th>MVP</th><th v-if="canRate">Voto</th></tr></thead>
            <tbody>
              <tr v-for="r in table" :key="r.id">
                <td><NuxtLink :to="`/team/${r.slug}`">{{ r.name }}</NuxtLink></td>
                <td>{{ r.appearances }}</td><td>{{ r.goals }}</td><td>{{ r.assists }}</td><td>{{ r.mvps }}</td>
                <td v-if="canRate">{{ fmt(r.avgRating) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-else title="Nessun giocatore ha ancora giocato" text="Il campo aspetta." />
      </section>
    </div>
    </Transition>
  </div>
</template>

<style scoped>
.bar { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; justify-content: space-between; margin-bottom: var(--space-5); }
.sel { width: auto; min-width: 160px; }
.skel { display: grid; gap: var(--space-3); }
.team { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
.team .wide { grid-column: 1 / -1; }
.ranks { display: grid; gap: var(--space-4); }
.list { list-style: none; margin: var(--space-3) 0 0; padding: 0; }
.table-wrap { overflow-x: auto; padding: var(--space-3); }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; white-space: nowrap; }
th, td { text-align: left; padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--rv-line); }
th { font-size: var(--fs-cap); color: var(--rv-muted); font-weight: var(--fw-ui); text-transform: uppercase; letter-spacing: .08em; }
td a { text-decoration: none; font-weight: var(--fw-ui); }
@media (min-width: 701px) { .team { grid-template-columns: repeat(3, 1fr); } .ranks { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1051px) { .team { grid-template-columns: repeat(4, 1fr); } }
</style>
