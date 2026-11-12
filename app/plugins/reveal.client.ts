import type { Directive } from 'vue'

/**
 * `v-reveal` (optionally `v-reveal="index"` for a stagger): the element fades and rises into place the
 * first time it scrolls into view. With reduced motion it is shown as is. One shared observer.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const observer = reduced || !('IntersectionObserver' in window)
    ? null
    : new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-visible')
          observer!.unobserve(e.target)
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })

  const reveal: Directive<HTMLElement, number | undefined> = {
    mounted(el, binding) {
      if (!observer) return
      el.classList.add('reveal')
      if (binding.value != null) el.dataset.rd = String(Math.min(6, Math.max(0, binding.value)))
      observer.observe(el)
    },
    unmounted(el) {
      observer?.unobserve(el)
    },
  }
  nuxtApp.vueApp.directive('reveal', reveal)
})
