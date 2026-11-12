<script setup lang="ts">
import { TEAM_ROLES } from '~/types/domain'

definePageMeta({ roles: TEAM_ROLES })
useHead({ title: 'Annunci · Rall Venezia' })
const { data, status } = useAnnouncements()
</script>

<template>
  <div class="page">
    <NuxtLink to="/clubhouse" class="muted back">← Spogliatoio</NuxtLink>
    <PageHero eyebrow="Dallo spogliatoio" title="Annunci" />
    <div v-if="status === 'pending' && !data" class="stack"><SkeletonBlock v-for="n in 3" :key="n" size="lg" /></div>
    <ul v-else-if="data?.length" class="stack" aria-label="Annunci">
      <li v-for="a in data" :key="a.id"><AnnouncementCard :title="a.title" :body="a.body" :at="a.published_at" :pinned="a.pinned" /></li>
    </ul>
    <EmptyState v-else title="Nessun annuncio" text="Lo spogliatoio è in silenzio." />
  </div>
</template>

<style scoped>
.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }
.stack { display: grid; gap: var(--space-3); list-style: none; margin: 0; padding: 0; max-width: 760px; }
</style>
