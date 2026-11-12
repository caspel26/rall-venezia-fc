export interface Rankable {
  id: string
  name: string
  appearances: number
}

export interface RankedRow<T> {
  position: number
  row: T
  value: number
}

/**
 * Ranking with the documented tie-break: higher value first, then fewer appearances (same output
 * in fewer games is better), then name. Equal value + appearances share a position (1,1,3).
 */
export function rankBy<T extends Rankable>(rows: T[], value: (r: T) => number | null | undefined, limit = 5): RankedRow<T>[] {
  const scored = rows
    .map((row) => ({ row, value: Number(value(row) ?? 0) }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value || a.row.appearances - b.row.appearances || a.row.name.localeCompare(b.row.name, 'it'))

  let position = 0
  return scored.slice(0, limit).map((s, i, arr) => {
    const prev = arr[i - 1]
    const tied = prev && prev.value === s.value && prev.row.appearances === s.row.appearances
    if (!tied) position = i + 1
    return { position, row: s.row, value: s.value }
  })
}
