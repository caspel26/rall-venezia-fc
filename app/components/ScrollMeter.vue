<script setup lang="ts">
// Thin orange progress bar at the top of the page: how far down the page you are.
const bar = ref<HTMLElement | null>(null)
let frame = 0
function update() {
  frame = 0
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  if (bar.value) bar.value.style.transform = `scaleX(${max > 0 ? Math.min(1, h.scrollTop / max) : 0})`
}
const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); update() })
onBeforeUnmount(() => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) })
const route = useRoute()
watch(() => route.fullPath, () => nextTick(update))
</script>

<template>
  <div ref="bar" class="scroll-meter" aria-hidden="true" />
</template>
