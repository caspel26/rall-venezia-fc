<script setup lang="ts">
// The club roundel (winged lion). Supplied artwork is 150px, so avoid rendering it much larger than ~112px.
withDefaults(defineProps<{ size?: number }>(), { size: 96 })
</script>

<template>
  <img src="/brand/logo.png" :width="size" :height="size" alt="Rall Venezia FC" class="logo" decoding="async">
</template>

<style scoped>
.logo { display: block; border-radius: var(--r-pill); }
</style>
