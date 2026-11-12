export interface GoalDraft {
  scorer: string
  assist: string
  minute: number | null
  own: boolean
}

export interface ResultDraft {
  rv: number | null
  opp: number | null
  /** player id -> played / starter */
  lineup: Record<string, { played: boolean; starter: boolean }>
  goals: GoalDraft[]
  mvp: string
}

export type ResultErrors = Partial<Record<'score' | 'lineup' | 'goals' | 'mvp' | 'scorers', string>>

/** Client-side mirror of the checks in the `record_match_result` RPC (which stays the real guard). */
export function validateResult(d: ResultDraft): ResultErrors {
  const e: ResultErrors = {}
  const played = new Set(Object.entries(d.lineup).filter(([, v]) => v.played).map(([id]) => id))
  if (d.rv == null || d.opp == null || d.rv < 0 || d.opp < 0) e.score = 'Inserisci il risultato finale.'
  if (!played.size) e.lineup = 'Seleziona chi ha giocato.'
  if (d.rv != null && d.goals.length > d.rv) e.goals = `Hai inserito ${d.goals.length} gol ma il risultato è ${d.rv}.`
  if (d.goals.some((g) => !g.own && !g.scorer)) e.scorers = 'Ogni gol ha bisogno di un marcatore.'
  else if (d.goals.some((g) => (!g.own && !played.has(g.scorer)) || (g.assist && !played.has(g.assist)))) {
    e.scorers = 'Marcatori e assistman devono aver giocato.'
  }
  if (d.mvp && !played.has(d.mvp)) e.mvp = 'L’MVP deve aver giocato.'
  return e
}

/** Payload for the RPC: lineup, goals (empty assist -> null) and the MVP list. */
export function buildResultPayload(d: ResultDraft) {
  return {
    p_rv_score: d.rv ?? 0,
    p_opp_score: d.opp ?? 0,
    p_lineup: Object.entries(d.lineup).filter(([, v]) => v.played).map(([player_id, v]) => ({ player_id, is_starter: v.starter })),
    p_goals: d.goals.map((g) => ({
      scorer_id: g.own ? null : g.scorer,
      assist_id: g.own || !g.assist ? null : g.assist,
      minute: g.minute,
      is_own_goal: g.own,
    })),
    p_mvp_ids: d.mvp ? [d.mvp] : [],
  }
}

