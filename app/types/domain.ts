export type Role = 'admin' | 'staff' | 'player' | 'viewer'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  staff: 'Staff',
  player: 'Giocatore',
  viewer: 'Ospite',
}

export const hasRole = (role: Role | null, allowed: readonly Role[]): boolean => !!role && allowed.includes(role)

/** Roles that can reach the locker room. */
export const TEAM_ROLES: readonly Role[] = ['admin', 'staff', 'player']
export const STAFF_ROLES: readonly Role[] = ['admin', 'staff']
export const ALL_ROLES: readonly Role[] = ['admin', 'staff', 'player', 'viewer']

import type { Tables } from '~/types/database'

export type PlayerRow = Tables<'players'>
export type MatchRow = Tables<'matches'>
export type OpponentRow = Tables<'opponents'>
export type AnnouncementRow = Tables<'announcements'>
export type AvailabilityStatus = 'available' | 'maybe' | 'unavailable'
