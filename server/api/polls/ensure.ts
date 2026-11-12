import { authorizeCronOrRole } from '../../utils/cronAuth'
import { nextMondayAfter, pollClosesAt, weeklyPollFor } from '../../utils/weeklyPoll'

const romeDay = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(d) // YYYY-MM-DD

// Run daily by the scheduler: the day after a match it opens the Mon-Fri availability poll for the coming week.
// Staff can also open next week's poll by hand ({ force: true }). Idempotent: one poll per week.
export default defineEventHandler(async (event) => {
  const { admin, cron } = await authorizeCronOrRole(event, ['admin', 'staff'])
  const body = cron ? {} : await readBody<{ force?: boolean }>(event).catch(() => ({}))
  const today = romeDay(new Date())

  let weekStart: string | null
  if ((body as { force?: boolean })?.force) {
    weekStart = nextMondayAfter(today)
  } else {
    const since = new Date(Date.now() - 3 * 86_400_000).toISOString()
    const { data } = await admin.from('matches').select('kickoff_at, status').gte('kickoff_at', since).neq('status', 'cancelled')
    weekStart = weeklyPollFor(today, (data ?? []).map((m) => romeDay(new Date(m.kickoff_at))))
  }
  if (!weekStart) return { created: false, weekStart: null }

  const { data: existing } = await admin.from('polls').select('id').eq('week_start', weekStart).maybeSingle()
  if (existing) return { created: false, weekStart }
  const { error } = await admin.from('polls').insert({ week_start: weekStart, closes_at: pollClosesAt(weekStart) })
  if (error) throw createError({ statusCode: 500, statusMessage: 'poll_failed' })
  return { created: true, weekStart }
})
