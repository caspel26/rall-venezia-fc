<script setup lang="ts">
import type { NewsCategory } from '~/utils/news'
const props = defineProps<{ path?: string | null; alt?: string; category?: NewsCategory }>()
const url = usePhotoUrl('graphics', toRef(props, 'path'))
const loaded = ref(false)
watch(url, () => { loaded.value = false })
</script>

<template>
  <div class="cover" :class="{ stage: !path }">
    <img v-if="url" :src="url" :alt="alt ?? ''" loading="lazy" decoding="async" :class="{ in: loaded }" @load="loaded = true">
    <template v-if="!path">
      <AppIcon class="ph" :name="NEWS_CATEGORIES[category ?? 'club'].icon" :size="64" />
      <img class="crest" src="/brand/logo.png" alt="" width="150" height="150" aria-hidden="true">
    </template>
  </div>
</template>

<style scoped>
.cover { position: relative; overflow: hidden; background: var(--rv-surface-2); aspect-ratio: 16 / 10; display: grid; place-items: center; --ring-size: 140%; --ring-top: -20%; --stage-fade: transparent; }
.cover.stage::after { display: none; }
.cover > img:not(.crest) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0; transition: opacity 400ms var(--ease-out), transform 600ms var(--ease-out); }
.cover > img.in { opacity: 1; }
.ph { color: var(--rv-orange-line); width: 30%; height: 30%; }
.crest { position: absolute; right: 8%; bottom: 10%; width: 20%; opacity: .2; border-radius: 50%; }
</style>
