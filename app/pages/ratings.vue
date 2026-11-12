<script setup lang="ts">
import { TEAM_ROLES } from '~/types/domain'
definePageMeta({ roles: TEAM_ROLES })
useHead({ title: 'Pagelle · Rall Venezia' })
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Archivio" title="Pagelle" lead="Voti e giudizi dopo ogni partita." />
    <EmptyState title="In arrivo" text="Questa sezione è in costruzione." />
  </div>
</template>
