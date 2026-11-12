<script setup lang="ts">
import type { Database } from '~/types/database'
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Risultato · Admin' })

const route = useRoute()
const client = useSupabaseClient<Database>()
const id = String(route.params.id)

const { data, status } = useAsyncData(`admin-result-${id}`, async () => {
  const [match, players, lineup, goals, mvps, ratings, availability] = await Promise.all([
    client.from('matches').select('*, opponent:opponents(name)').eq('id', id).maybeSingle(),
    client.from('players').select('*').eq('is_active', true),
    client.from('match_players').select('player_id, is_starter').eq('match_id', id),
    client.from('goals').select('*').eq('match_id', id).order('minute'),
    client.from('mvp_awards').select('player_id').eq('match_id', id),
    client.from('ratings').select('*').eq('match_id', id),
    client.from('availability').select('player_id, status').eq('match_id', id),
  ])
  return {
    match: match.data,
    players: (players.data ?? []).sort((a, b) => (a.shirt_number ?? 999) - (b.shirt_number ?? 999) || a.last_name.localeCompare(b.last_name, 'it')),
    lineup: lineup.data ?? [], goals: goals.data ?? [], mvps: mvps.data ?? [], ratings: ratings.data ?? [], availability: availability.data ?? [],
  }
}, { lazy: true })

const draft = reactive<ResultDraft>({ rv: null, opp: null, lineup: {}, goals: [], mvp: '' })
const rate = reactive<Record<string, { score: string; review: string; attrs: string }>>({})
const publish = ref(true)
const busy = ref(false)
const done = ref(false)
const serverError = ref('')
const submitted = ref(false)

watch(data, (d) => {
  if (!d?.match) return
  draft.rv = d.match.rv_score
  draft.opp = d.match.opp_score
  const played = new Set(d.lineup.map((l) => l.player_id))
  const asked = new Set(d.availability.filter((a) => a.status === 'available').map((a) => a.player_id))
  for (const p of d.players) {
    const l = d.lineup.find((x) => x.player_id === p.id)
    // a match not yet closed starts from the players who said they were available
    draft.lineup[p.id] = { played: d.lineup.length ? played.has(p.id) : asked.has(p.id), starter: l?.is_starter ?? false }
    const r = d.ratings.find((x) => x.player_id === p.id)
    rate[p.id] = { score: r ? String(r.score) : '', review: r?.review ?? '', attrs: r?.attributes?.join(', ') ?? '' }
  }
  draft.goals = d.goals.map((g) => ({ scorer: g.scorer_id ?? '', assist: g.assist_id ?? '', minute: g.minute, own: g.is_own_goal }))
  draft.mvp = d.mvps[0]?.player_id ?? ''
  publish.value = d.ratings.length ? d.ratings.every((r) => r.published) : true
}, { immediate: true })

const errors = computed(() => (submitted.value ? validateResult(draft) : {}))
const playedPlayers = computed(() => (data.value?.players ?? []).filter((p) => draft.lineup[p.id]?.played))
const unassigned = computed(() => (draft.rv ?? 0) - draft.goals.length)

function addGoal() {
  const last = draft.goals[draft.goals.length - 1]
  draft.goals.push({ scorer: last?.scorer ?? '', assist: '', minute: null, own: false })
}

async function save() {
  submitted.value = true
  serverError.value = ''
  if (Object.keys(validateResult(draft)).length) return
  busy.value = true
  const { error } = await client.rpc('record_match_result', { p_match_id: id, ...buildResultPayload(draft) })
  if (error) {
    serverError.value = /goals_exceed_score/.test(error.message) ? 'I gol inseriti superano il risultato.' : 'Non siamo riusciti a salvare il risultato. Riprova.'
    busy.value = false
    return
  }
  const rows = playedPlayers.value
    .filter((p) => rate[p.id]?.score !== '' && rate[p.id]?.score != null)
    .map((p) => ({
      match_id: id, player_id: p.id, score: Math.min(10, Math.max(0, Number(rate[p.id]!.score))),
      review: rate[p.id]!.review.trim() || null, attributes: parseAttributes(rate[p.id]!.attrs), published: publish.value,
    }))
  if (rows.length) {
    const { error: e } = await client.from('ratings').upsert(rows, { onConflict: 'match_id,player_id' })
    if (e) { serverError.value = 'Risultato salvato, ma le pagelle no. Riprova.'; busy.value = false; return }
  }
  busy.value = false
  done.value = true
}
</script>

<template>
  <div class="page">
    <NuxtLink to="/admin/matches" class="muted back">← Partite</NuxtLink>
    <SkeletonBlock v-if="status === 'pending' && !data" size="hero" />

    <template v-else-if="data?.match">
      <PageHero eyebrow="Dopo la partita" :title="`Rall Venezia vs ${data.match.opponent?.name}`" :lead="formatDay(data.match.kickoff_at)" />

      <div v-if="done" class="notice ok" role="status">
        <p><strong>Tre punti portati a casa.</strong> Risultato salvato.</p>
        <p class="row-actions"><NuxtLink :to="`/matches/${id}`" class="btn btn-primary">Vedi la partita</NuxtLink><NuxtLink to="/admin/matches" class="btn">Torna alle partite</NuxtLink></p>
      </div>

      <form v-else class="flow" novalidate @submit.prevent="save">
        <section class="panel step" aria-labelledby="s1">
          <h2 id="s1" class="eyebrow">1 · Risultato finale</h2>
          <div class="score">
            <label class="sc"><span>Rall Venezia</span>
              <input v-model.number="draft.rv" class="input big tabular" type="number" inputmode="numeric" min="0" max="99" aria-label="Gol Rall Venezia"></label>
            <span class="dash display">—</span>
            <label class="sc"><span>{{ data.match.opponent?.name }}</span>
              <input v-model.number="draft.opp" class="input big tabular" type="number" inputmode="numeric" min="0" max="99" :aria-label="`Gol ${data.match.opponent?.name}`"></label>
          </div>
          <p v-if="errors.score" class="err" role="alert">{{ errors.score }}</p>
        </section>

        <section class="panel step" aria-labelledby="s2">
          <h2 id="s2" class="eyebrow">2 · Chi ha giocato</h2>
          <ul class="plist">
            <li v-for="p in data.players" :key="p.id" class="prow">
              <label class="check"><input v-model="draft.lineup[p.id]!.played" type="checkbox" :aria-label="`${fullName(p)} ha giocato`"> <span class="n display tabular">{{ p.shirt_number ?? '·' }}</span> {{ fullName(p) }}</label>
              <label v-if="draft.lineup[p.id]?.played" class="check small"><input v-model="draft.lineup[p.id]!.starter" type="checkbox"> Titolare</label>
            </li>
          </ul>
          <p v-if="errors.lineup" class="err" role="alert">{{ errors.lineup }}</p>
        </section>

        <section class="panel step" aria-labelledby="s3">
          <h2 id="s3" class="eyebrow">3 · Gol e assist</h2>
          <p v-if="draft.rv != null" class="muted">{{ unassigned > 0 ? `${unassigned} gol da assegnare` : unassigned === 0 ? 'Tutti i gol assegnati' : 'Troppi gol inseriti' }}</p>
          <ul class="goals">
            <li v-for="(g, i) in draft.goals" :key="i" class="goal">
              <span class="gn display tabular">{{ i + 1 }}</span>
              <select v-if="!g.own" v-model="g.scorer" class="input" :aria-label="`Marcatore gol ${i + 1}`">
                <option value="">Marcatore…</option>
                <option v-for="p in playedPlayers" :key="p.id" :value="p.id">{{ fullName(p) }}</option>
              </select>
              <span v-else class="muted own">Autogol avversario</span>
              <select v-if="!g.own" v-model="g.assist" class="input" :aria-label="`Assist gol ${i + 1}`">
                <option value="">Senza assist</option>
                <option v-for="p in playedPlayers.filter((x) => x.id !== g.scorer)" :key="p.id" :value="p.id">{{ fullName(p) }}</option>
              </select>
              <input v-model.number="g.minute" class="input min" type="number" inputmode="numeric" min="0" max="120" placeholder="Min" :aria-label="`Minuto gol ${i + 1}`">
              <label class="check small"><input v-model="g.own" type="checkbox"> Autogol</label>
              <button type="button" class="btn btn-sm btn-danger" :aria-label="`Rimuovi gol ${i + 1}`" @click="draft.goals.splice(i, 1)">✕</button>
            </li>
          </ul>
          <p v-if="errors.goals" class="err" role="alert">{{ errors.goals }}</p>
          <p v-if="errors.scorers" class="err" role="alert">{{ errors.scorers }}</p>
          <button type="button" class="btn btn-sm" @click="addGoal">+ Aggiungi gol</button>
        </section>

        <section class="panel step" aria-labelledby="s4">
          <h2 id="s4" class="eyebrow">4 · MVP</h2>
          <select v-model="draft.mvp" class="input" aria-label="MVP">
            <option value="">Nessuno</option>
            <option v-for="p in playedPlayers" :key="p.id" :value="p.id">{{ fullName(p) }}</option>
          </select>
          <p v-if="errors.mvp" class="err" role="alert">{{ errors.mvp }}</p>
        </section>

        <section class="panel step" aria-labelledby="s5">
          <details>
            <summary id="s5" class="eyebrow sum">5 · Pagelle (opzionale)</summary>
            <div class="rates">
              <div v-for="p in playedPlayers" :key="p.id" class="rate">
                <p class="rname">{{ fullName(p) }}</p>
                <input v-model="rate[p.id]!.score" class="input sc2" type="number" step="0.5" min="0" max="10" inputmode="decimal" placeholder="Voto" :aria-label="`Voto ${fullName(p)}`">
                <input v-model="rate[p.id]!.attrs" class="input" type="text" placeholder="Punti di forza (max 4, separati da virgola)" :aria-label="`Punti di forza ${fullName(p)}`">
                <textarea v-model="rate[p.id]!.review" class="input" rows="2" placeholder="Giudizio" :aria-label="`Giudizio ${fullName(p)}`" />
              </div>
              <p v-if="!playedPlayers.length" class="muted">Seleziona prima chi ha giocato.</p>
              <label class="check"><input v-model="publish" type="checkbox"> Pubblica le pagelle</label>
            </div>
          </details>
        </section>

        <p v-if="serverError" class="notice bad" role="alert">{{ serverError }}</p>
        <div class="savebar"><button class="btn btn-primary btn-block" type="submit" :disabled="busy">Salva e pubblica</button></div>
      </form>
    </template>
    <EmptyState v-else title="Partita non trovata" />
  </div>
</template>

<style scoped>
.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }
.flow { display: grid; gap: var(--space-4); max-width: 820px; }
.step { display: grid; gap: var(--space-3); }
.score { display: grid; grid-template-columns: 1fr auto 1fr; gap: var(--space-3); align-items: end; }
.sc { display: grid; gap: var(--space-1); font-size: var(--fs-sm); font-weight: var(--fw-ui); }
.big { font-family: var(--font-display); font-size: var(--fs-h1); text-align: center; min-height: 72px; }
.dash { font-size: var(--fs-h1); padding-bottom: var(--space-4); color: var(--rv-muted); }
.plist, .goals { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-1); }
.prow { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); border-bottom: 1px solid var(--rv-line); }
.n { width: 28px; text-align: right; color: var(--rv-orange); }
.small { font-size: var(--fs-sm); color: var(--rv-muted); }
.goal { display: grid; grid-template-columns: 28px 1fr 1fr 80px; gap: var(--space-2); align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid var(--rv-line); }
.gn { color: var(--rv-orange); text-align: right; }
.own { grid-column: span 2; }
.goal .check, .goal .btn { grid-column: auto; }
.err { color: var(--rv-red); font-size: var(--fs-sm); }
.sum { cursor: pointer; min-height: 44px; display: flex; align-items: center; }
.rates { display: grid; gap: var(--space-4); margin-top: var(--space-3); }
.rate { display: grid; gap: var(--space-2); padding-bottom: var(--space-3); border-bottom: 1px solid var(--rv-line); }
.rname { font-weight: var(--fw-ui); }
.sc2 { max-width: 120px; }
.savebar { position: sticky; bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + var(--space-2)); z-index: 5; }
@media (max-width: 700px) {
  .goal { grid-template-columns: 28px 1fr; }
  .goal .min { grid-column: 2; }
}
@media (min-width: 1051px) { .savebar { bottom: var(--space-4); } }
</style>
