<script setup lang="ts">
import type { Tables } from '~/types/database'
defineProps<{ member: Tables<'staff_members'> }>()
</script>

<template>
  <article class="staff">
    <PlayerPortrait class="ph" :first="member.first_name" :last="member.last_name" :number="null" :photo-path="member.photo_path" />
    <div class="info">
      <p class="eyebrow role">{{ member.role_title }}</p>
      <h3 class="display">{{ member.first_name }} <br>{{ member.last_name }}</h3>
      <p v-if="!member.photo_path" class="muted soon">Foto in arrivo</p>
    </div>
  </article>
</template>

<style scoped>
.staff { display: grid; align-content: start; border: 1px solid var(--rv-line); border-radius: var(--r-card); overflow: hidden; background: var(--rv-surface); }
.info { display: grid; gap: var(--space-1); padding: var(--space-3) var(--space-4) var(--space-4); }
.role { color: var(--rv-orange); }
h3 { font-size: var(--fs-h2); line-height: .95; }
.soon { font-size: var(--fs-sm); }
</style>
