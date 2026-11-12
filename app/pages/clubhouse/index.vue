<script setup lang="ts">
import { TEAM_ROLES } from '~/types/domain'
definePageMeta({ roles: TEAM_ROLES })
useHead({ title: 'Spogliatoio · Rall Venezia' })
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Riservato" title="Spogliatoio" lead="Disponibilità e comunicazioni interne." />
    <EmptyState title="In arrivo" text="Questa sezione è in costruzione." />
  </div>
</template>
