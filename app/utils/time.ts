const TZ = 'Europe/Rome'

const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
})

/** Offset of Europe/Rome from UTC at a given instant, in ms. */
function romeOffset(ts: number): number {
  const p = Object.fromEntries(parts.formatToParts(new Date(ts)).map((x) => [x.type, x.value]))
  const asUtc = Date.UTC(+p.year!, +p.month! - 1, +p.day!, +p.hour!, +p.minute!)
  return asUtc - Math.floor(ts / 60000) * 60000
}

/** "2026-11-17T20:00" typed in a datetime-local input (Rome wall clock) -> ISO instant. */
export function romeLocalToIso(local: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local)
  if (!m) throw new Error('invalid datetime')
  const guess = Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, +m[4]!, +m[5]!)
  let ts = guess - romeOffset(guess)
  ts = guess - romeOffset(ts) // settle across a DST change
  return new Date(ts).toISOString()
}

/** ISO instant -> value for a datetime-local input in Rome wall clock. */
export function isoToRomeLocal(iso: string): string {
  const p = Object.fromEntries(parts.formatToParts(new Date(iso)).map((x) => [x.type, x.value]))
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`
}
