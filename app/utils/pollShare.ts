import { formatTime, pollDay } from './format'

/** The message pasted into the WhatsApp group: which week, what to do, where to vote, until when. */
export function pollShareText(poll: { week_start: string; closes_at: string }, url: string): string {
  const a = pollDay(poll.week_start)
  const lastDay = new Date(Date.parse(`${poll.week_start}T00:00:00Z`) + 4 * 86_400_000).toISOString().slice(0, 10)
  const b = pollDay(lastDay)
  const range = a.month === b.month ? `${a.num}–${b.num} ${b.month}` : `${a.num} ${a.month} – ${b.num} ${b.month}`
  const closes = `${new Intl.DateTimeFormat('it-IT', { weekday: 'long', timeZone: 'Europe/Rome' }).format(new Date(poll.closes_at))} alle ${formatTime(poll.closes_at)}`
  return [
    `📅 Sondaggio Rall Venezia · settimana ${range}`,
    'Segna tutti i giorni da lunedì a venerdì in cui ci sei (puoi sceglierne più di uno):',
    url,
    `Si chiude ${closes}.`,
  ].join('\n')
}

export const whatsappLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`
