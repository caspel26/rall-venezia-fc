<script setup lang="ts">
const { user, role, signOut } = useAuth()
</script>

<template>
  <main class="page">
    <p class="eyebrow">Stage 3 — autenticazione</p>
    <h1>Ciao {{ user?.user_metadata?.display_name ?? user?.email }}</h1>
    <p class="muted">Ruolo: {{ role }}</p>
    <button class="btn" type="button" @click="signOut">Esci</button>
  </main>
</template>
