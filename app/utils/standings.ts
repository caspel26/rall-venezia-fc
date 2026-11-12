export interface StandingRow {
  team: string
  points: number
  sort_order: number
  is_us?: boolean
}

/** Points first, then the manual order (ties are decided by hand: the table keeps whatever order you set). */
export function rankStandings<T extends StandingRow>(rows: T[]): (T & { position: number })[] {
  return [...rows]
    .sort((a, b) => b.points - a.points || a.sort_order - b.sort_order || a.team.localeCompare(b.team, 'it'))
    .map((r, i) => ({ ...r, position: i + 1 }))
}

/**
 * Turn a pasted table into rows. Accepts one team per line in the order of the table:
 * "1 LAZIO 21", "Lazio 21", "Lazio - 21", "Lazio, 21", "Lazio\t21". The last whole number on the line is the points;
 * a leading rank number and separators are ignored. Lines without a team name or points are skipped.
 */
export function parseStandings(text: string): { team: string; points: number }[] {
  const out: { team: string; points: number }[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    const m = /^(?:\d{1,2}[.)]?\s+)?(.*?)[\s,;:\-–—|]*?(\d{1,3})\s*(?:pt|pti|punti)?\s*$/i.exec(line)
    if (!m) continue
    const team = m[1]!.replace(/[\s,;:\-–—|]+$/, '').trim()
    if (!team || /^\d+$/.test(team)) continue
    out.push({ team: team.replace(/\s+/g, ' ').replace(/\b(\p{L})(\p{L}*)/gu, (_, a: string, b: string) => a.toUpperCase() + b.toLowerCase()), points: Number(m[2]) })
  }
  return out
}
