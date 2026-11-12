<script setup lang="ts">
import { RESULT_LABEL, type ResultLetter } from '~/utils/results'
defineProps<{ result: ResultLetter }>()
</script>

<template>
  <span class="pill" :class="`pill-${result.toLowerCase()}`" :aria-label="RESULT_LABEL[result].word">{{ RESULT_LABEL[result].letter }}</span>
</template>
