import type { Directive } from 'vue'

/**
 * `v-tilt`: a card leans toward the pointer and a light follows it. Fine pointers only, never with reduced motion;
 * everywhere else it does nothing (the hover lift in CSS still applies).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const ok = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const tilt: Directive<HTMLElement> = {
    mounted(el) {
      if (!ok) return
      let frame = 0
      let e: PointerEvent | null = null
      const apply = () => {
        frame = 0
        if (!e) return
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        el.style.setProperty('--ry', `${(px - 0.5) * 10}deg`)
        el.style.setProperty('--rx', `${(0.5 - py) * 8}deg`)
        el.style.setProperty('--mx', `${px * 100}%`)
        el.style.setProperty('--my', `${py * 100}%`)
      }
      el.addEventListener('pointermove', (ev) => { e = ev; if (!frame) frame = requestAnimationFrame(apply) })
      el.addEventListener('pointerleave', () => {
        e = null
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg')
        el.style.setProperty('--mx', '50%'); el.style.setProperty('--my', '0%')
      })
    },
  }
  nuxtApp.vueApp.directive('tilt', tilt)
})
