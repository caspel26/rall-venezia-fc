<script setup lang="ts">
import { STAFF_ROLES } from '~/types/domain'

definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Nuovo giocatore · Admin' })
</script>

<template>
  <div class="page">
    <NuxtLink to="/admin/players" class="muted back">← Giocatori</NuxtLink>
    <PageHero eyebrow="Admin" title="Nuovo giocatore" />
    <PlayerForm @saved="navigateTo('/admin/players')" />
  </div>
</template>

<style scoped>.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }</style>
