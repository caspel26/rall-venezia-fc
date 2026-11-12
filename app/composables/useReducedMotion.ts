/** True when the visitor asked for reduced motion (client only; false during SSR). */
export function useReducedMotion() {
  const reduced = ref(false)
  onMounted(() => {
    reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  return reduced
}
