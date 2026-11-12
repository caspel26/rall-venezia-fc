<script setup lang="ts">
import { hasRole, STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Admin · Rall Venezia' })
const { role } = useAuth()
const cards = computed(() => [
  { to: '/admin/matches/new', title: 'Nuova partita', text: 'Programma una partita.' },
  { to: '/admin/matches', title: 'Partite e risultati', text: 'Chiudi una partita: risultato, gol, MVP, pagelle.' },
  { to: '/admin/players', title: 'Giocatori', text: 'Rosa, numeri, foto e account collegati.' },
  { to: '/admin/ratings', title: 'Pagelle', text: 'Pubblica o nascondi i voti.' },
  { to: '/admin/announcements', title: 'Annunci', text: 'Comunicazioni dello spogliatoio.' },
  { to: '/admin/news', title: 'Gazzetta', text: 'Scrivi le notizie.' },
  ...(hasRole(role.value, ['admin']) ? [{ to: '/admin/instagram', title: 'Instagram', text: 'Collega il profilo: i nuovi post finiscono in Gazzetta.' }, { to: '/admin/users', title: 'Utenti', text: 'Inviti, ruoli, collegamenti ai giocatori.' }] : []),
])
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Gestione" title="Admin" lead="Tutto quello che serve, niente di più." />
    <ul class="grid">
      <li v-for="c in cards" :key="c.to">
        <NuxtLink :to="c.to" class="card"><h2 class="display">{{ c.title }}</h2><p class="muted">{{ c.text }}</p></NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.grid { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-3); }
.card { display: grid; gap: var(--space-1); padding: var(--space-5); border: 1px solid var(--rv-line); border-radius: var(--r-panel); background: var(--rv-surface); text-decoration: none; height: 100%; transition: border-color var(--dur) var(--ease-standard); }
.card:hover { border-color: var(--rv-orange); }
h2 { font-size: var(--fs-h2); }
@media (min-width: 701px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1051px) { .grid { grid-template-columns: repeat(3, 1fr); } }
</style>
