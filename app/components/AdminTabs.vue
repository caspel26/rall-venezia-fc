<script setup lang="ts">
import { hasRole } from '~/types/domain'

const { role } = useAuth()
const route = useRoute()
const items = [
  { to: '/admin/matches', label: 'Partite' },
  { to: '/admin/players', label: 'Giocatori' },
  { to: '/admin/ratings', label: 'Pagelle' },
  { to: '/admin/announcements', label: 'Annunci' },
  { to: '/admin/news', label: 'Gazzetta' },
  { to: '/admin/instagram', label: 'Instagram', roles: ['admin'] as const },
  { to: '/admin/users', label: 'Utenti', roles: ['admin'] as const },
]
const visible = computed(() => items.filter((i) => !i.roles || hasRole(role.value, i.roles)))
</script>

<template>
  <nav class="tabs" aria-label="Sezioni admin">
    <NuxtLink v-for="i in visible" :key="i.to" :to="i.to" :aria-current="route.path.startsWith(i.to) ? 'page' : undefined">{{ i.label }}</NuxtLink>
  </nav>
</template>

<style scoped>
.tabs { display: flex; gap: var(--space-1); overflow-x: auto; margin-bottom: var(--space-5); padding: var(--space-1); background: var(--rv-surface); border: 1px solid var(--rv-line); border-radius: var(--r-s); max-width: max-content; max-width: 100%; }
a { min-height: 40px; display: inline-flex; align-items: center; padding: 0 var(--space-4); border-radius: var(--r-s); text-decoration: none; color: var(--rv-muted); font: var(--fw-ui) var(--fs-sm)/1 var(--font-ui); white-space: nowrap; }
a[aria-current='page'] { background: var(--rv-orange); color: var(--rv-orange-ink); }
</style>
