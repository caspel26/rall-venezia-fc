<script setup lang="ts">
const { user, role } = useAuth()
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Stage 4 — shell" :title="`Ciao ${user?.user_metadata?.display_name ?? ''}`" />
    <p class="muted">Ruolo: {{ role }}</p>
  </div>
</template>
