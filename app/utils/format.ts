const TZ = 'Europe/Rome'

const dayFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })
const shortDayFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', timeZone: TZ })
const timeFmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: TZ })

export const formatDay = (iso: string) => dayFmt.format(new Date(iso))
export const formatShortDay = (iso: string) => shortDayFmt.format(new Date(iso))
export const formatTime = (iso: string) => timeFmt.format(new Date(iso))

export const formatScore = (n: number | null | undefined) => (n == null ? '–' : String(n))

/** Rating shown with one decimal, Italian comma. */
export const formatRating = (n: number | null | undefined) => (n == null ? '–' : n.toFixed(1).replace('.', ','))

export interface NamedPlayer {
  first_name: string
  last_name: string
  nickname?: string | null
}

export const fullName = (p: NamedPlayer) => `${p.first_name} ${p.last_name}`

export const POSITION_LABELS: Record<string, string> = {
  goalkeeper: 'Portiere',
  defender: 'Difensore',
  winger: 'Esterno',
  midfielder: 'Centrocampista',
  pivot: 'Pivot',
  jolly: 'Laterale / Jolly',
}
