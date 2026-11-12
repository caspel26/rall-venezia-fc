<script setup lang="ts">
import { hasRole, TEAM_ROLES } from '~/types/domain'

useHead({ title: 'Home · Rall Venezia' })
const { role, user } = useAuth()
const { data, status } = useHomeData()

const isTeam = computed(() => hasRole(role.value, TEAM_ROLES))
const greeting = computed(() => user.value?.user_metadata?.display_name?.split(' ')[0] ?? '')
const mvpName = computed(() => {
  const p = data.value?.last?.mvp_awards?.[0]?.player
  return p ? fullName(p) : undefined
})
const lastRel = computed(() => data.value?.last)
</script>

<template>
  <div class="page home">
    <header class="hello">
      <p class="eyebrow">Matchday</p>
      <h1 class="display">Ciao{{ greeting ? ` ${greeting}` : '' }}</h1>
    </header>

    <div v-if="status === 'pending' && !data" class="grid">
      <div class="main"><SkeletonBlock size="hero" /><SkeletonBlock size="lg" /><SkeletonBlock size="hero" /></div>
      <div class="side"><SkeletonBlock size="md" /><SkeletonBlock size="lg" /><SkeletonBlock size="lg" /></div>
    </div>

    <div v-else-if="data" class="grid">
      <div class="main">
        <section aria-labelledby="next-h">
          <h2 id="next-h" class="sr-only">Prossima partita</h2>
          <MatchCard v-if="data.next" variant="hero" :to="`/matches/${data.next.id}`" :opponent="data.next.opponent?.name ?? ''"
            :short="data.next.opponent?.short_name" :is-home="data.next.is_home" :kickoff-at="data.next.kickoff_at"
            :venue="data.next.venue" :competition="data.next.competition?.name" :status="data.next.status"
            :rv="data.next.rv_score" :opp="data.next.opp_score" />
          <EmptyState v-else title="Nessuna partita in programma" text="Per una volta possiamo riposare." />
        </section>

        <section v-if="data.next && isTeam" class="panel avail" aria-labelledby="av-h">
          <h2 id="av-h" class="eyebrow">Disponibilità</h2>
          <AvailabilitySelector v-if="data.myPlayerId" :match-id="data.next.id" :current="data.myAnswer" />
          <AvailabilitySummary :counts="data.availability" />
        </section>

        <section v-if="lastRel" class="panel last grain" aria-labelledby="last-h">
          <p id="last-h" class="eyebrow">Ultimo risultato</p>
          <ScoreBoard :rv="lastRel.rv_score" :opp="lastRel.opp_score" :is-home="lastRel.is_home" :opponent="lastRel.opponent?.name ?? ''" />
          <div class="meta">
            <MVPBadge v-if="mvpName" :name="mvpName" />
            <NuxtLink :to="`/matches/${lastRel.id}`" class="muted">Vai alla partita</NuxtLink>
          </div>
        </section>
        <EmptyState v-else title="Nessun risultato ancora" text="Il primo tre punti è in arrivo." />
      </div>

      <div class="side">
        <section class="panel" aria-labelledby="form-h">
          <h2 id="form-h" class="eyebrow">Forma</h2>
          <FormStrip v-if="data.form.length" :form="data.form" />
          <p v-else class="muted">Ancora nessuna partita giocata.</p>
        </section>

        <section class="panel tops" aria-labelledby="top-h">
          <h2 id="top-h" class="eyebrow">Migliori</h2>
          <StatCard v-if="data.top.goals" label="Capocannoniere" :value="data.top.goals.value" :sub="fullName(data.top.goals.player)" />
          <StatCard v-if="data.top.assists" label="Assist" :value="data.top.assists.value" :sub="fullName(data.top.assists.player)" />
          <StatCard v-if="data.top.mvps" label="MVP" :value="data.top.mvps.value" :sub="fullName(data.top.mvps.player)" />
          <p v-if="!data.top.goals" class="muted">Le classifiche si accendono dopo la prima partita.</p>
        </section>

        <section v-if="isTeam" aria-labelledby="rt-h">
          <h2 id="rt-h" class="sr-only">Ultima pagella</h2>
          <RatingCard v-if="data.rating?.player" :score="Number(data.rating.score)" :player="fullName(data.rating.player)"
            :review="data.rating.review" :attributes="data.rating.attributes"
            :context="data.rating.match ? `vs ${data.rating.match.opponent?.name}` : undefined" />
          <EmptyState v-else title="Nessuna pagella ancora" text="Il giudice è in ritardo." />
        </section>

        <section v-if="isTeam" aria-labelledby="an-h">
          <h2 id="an-h" class="sr-only">Ultimo annuncio</h2>
          <AnnouncementCard v-if="data.announcement" :title="data.announcement.title" :body="data.announcement.body"
            :at="data.announcement.published_at" :pinned="data.announcement.pinned" />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hello { padding-bottom: var(--space-5); }
.hello h1 { font-size: var(--fs-display); }
.grid { display: grid; gap: var(--space-5); }
.main, .side { display: grid; gap: var(--space-5); align-content: start; min-width: 0; }
.avail { display: grid; gap: var(--space-4); }
.last { display: grid; gap: var(--space-4); }
.meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); }
.tops { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.tops > .eyebrow, .tops > p { grid-column: 1 / -1; }
@media (min-width: 1051px) {
  .grid { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: var(--space-6); }
}
</style>
