<script setup lang="ts">
import { STAFF_ROLES } from '~/types/domain'
definePageMeta({ roles: STAFF_ROLES })
useHead({ title: 'Admin · Rall Venezia' })
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Gestione" title="Admin" lead="Partite, giocatori, pagelle e inviti." />
    <EmptyState title="In arrivo" text="Questa sezione è in costruzione." />
  </div>
</template>
