/** Dates are plain 'YYYY-MM-DD' strings in Europe/Rome. */
const DAY = 86_400_000
const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`)
const fromMs = (ms: number) => new Date(ms).toISOString().slice(0, 10)

export const addDays = (d: string, n: number) => fromMs(toMs(d) + n * DAY)

/** First Monday strictly after `d`. */
export function nextMondayAfter(d: string): string {
  const dow = new Date(toMs(d)).getUTCDay() // 0 = Sunday
  const ahead = ((8 - dow) % 7) || 7
  return addDays(d, ahead)
}

/**
 * The weekly poll is created the day after a match, for the Monday-to-Friday week that starts at the first
 * Monday after that match. Returns that Monday, or null when no match was played yesterday.
 */
export function weeklyPollFor(today: string, matchDays: string[]): string | null {
  const yesterday = addDays(today, -1)
  return matchDays.includes(yesterday) ? nextMondayAfter(yesterday) : null
}

/** Friday 20:00 Rome of the poll week, as an ISO instant (handles DST by trying both offsets). */
export function pollClosesAt(weekStart: string): string {
  const friday = addDays(weekStart, 4)
  for (const offset of [2, 1]) { // CEST then CET
    const iso = new Date(`${friday}T${String(20 - offset).padStart(2, '0')}:00:00Z`)
    const rome = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', hourCycle: 'h23' }).format(iso)
    if (rome === '20') return iso.toISOString()
  }
  return new Date(`${friday}T19:00:00Z`).toISOString()
}
