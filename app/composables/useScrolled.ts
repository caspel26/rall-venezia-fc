/** True once the page has scrolled a little (drives the blurred header). */
export function useScrolled(threshold = 8) {
  const scrolled = ref(false)
  const update = () => { scrolled.value = window.scrollY > threshold }
  onMounted(() => { window.addEventListener('scroll', update, { passive: true }); update() })
  onBeforeUnmount(() => window.removeEventListener('scroll', update))
  return scrolled
}
