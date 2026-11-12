export type ResultLetter = 'W' | 'D' | 'L'

export interface ScoredMatch {
  rv_score: number | null
  opp_score: number | null
}

/** Result from Rall Venezia's point of view; null while the score is unknown. */
export function resultOf(m: ScoredMatch): ResultLetter | null {
  if (m.rv_score == null || m.opp_score == null) return null
  if (m.rv_score > m.opp_score) return 'W'
  if (m.rv_score < m.opp_score) return 'L'
  return 'D'
}

/** Italian letters used in the UI: Vittoria / Nulla (pareggio) / Persa. */
export const RESULT_LABEL: Record<ResultLetter, { letter: string; word: string }> = {
  W: { letter: 'V', word: 'Vittoria' },
  D: { letter: 'N', word: 'Pareggio' },
  L: { letter: 'P', word: 'Sconfitta' },
}

/** Form strip, most recent last. */
export function formOf(matches: ScoredMatch[], size = 5): ResultLetter[] {
  return matches
    .map(resultOf)
    .filter((r): r is ResultLetter => r !== null)
    .slice(-size)
}

export interface AvailabilityCounts {
  available: number
  maybe: number
  unavailable: number
  noResponse: number
}

/** `answers` are the statuses given; `squadSize` is how many active players were asked. */
export function countAvailability(answers: string[], squadSize: number): AvailabilityCounts {
  const count = (s: string) => answers.filter((a) => a === s).length
  const available = count('available')
  const maybe = count('maybe')
  const unavailable = count('unavailable')
  return { available, maybe, unavailable, noResponse: Math.max(0, squadSize - available - maybe - unavailable) }
}
