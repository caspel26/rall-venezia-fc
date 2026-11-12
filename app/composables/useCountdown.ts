/** Ticks once a second until `iso`; days/hours/minutes/seconds are 0 once it has passed. */
export function useCountdown(iso: MaybeRefOrGetter<string | null | undefined>) {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
  onBeforeUnmount(() => clearInterval(timer))
  return computed(() => {
    const target = toValue(iso) ? new Date(toValue(iso)!).getTime() : now.value
    const left = Math.max(0, target - now.value)
    const s = Math.floor(left / 1000)
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, over: left === 0, soon: left > 0 && left < 24 * 3600 * 1000 }
  })
}
