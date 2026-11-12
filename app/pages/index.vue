<script setup lang="ts">
import { hasRole } from '~/types/domain'
import { HOME_WIDGETS } from '~/widgets/registry'

useHead({ title: 'Home · Rall Venezia' })
const { role, user } = useAuth()
const greeting = computed(() => user.value?.user_metadata?.display_name?.split(' ')[0] ?? '')
const visible = (slot: 'main' | 'side') => HOME_WIDGETS.filter((x) => x.slot === slot && hasRole(role.value, x.roles))
</script>

<template>
  <div class="page">
    <header class="hello">
      <p class="eyebrow">Matchday</p>
      <h1 class="display">Ciao{{ greeting ? ` ${greeting}` : '' }}</h1>
    </header>
    <div class="grid">
      <div class="col"><component :is="x.component" v-for="x in visible('main')" :key="x.id" /></div>
      <div class="col"><component :is="x.component" v-for="x in visible('side')" :key="x.id" /></div>
    </div>
  </div>
</template>

<style scoped>
.hello { padding-bottom: var(--space-5); }
.hello h1 { font-size: var(--fs-display); }
.grid { display: grid; gap: var(--space-5); }
.col { display: grid; gap: var(--space-5); align-content: start; min-width: 0; }
@media (min-width: 1051px) { .grid { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: var(--space-6); } }
</style>
