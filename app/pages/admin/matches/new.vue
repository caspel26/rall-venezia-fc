<script setup lang="ts">
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Nuova partita · Admin' })
</script>

<template>
  <div class="page">
    <NuxtLink to="/admin/matches" class="muted back">← Partite</NuxtLink>
    <PageHero eyebrow="Admin" title="Nuova partita" />
    <MatchForm @saved="navigateTo('/admin/matches')" />
  </div>
</template>

<style scoped>.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }</style>
