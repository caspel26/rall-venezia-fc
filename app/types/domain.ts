export type Role = 'admin' | 'staff' | 'player' | 'viewer'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  staff: 'Staff',
  player: 'Giocatore',
  viewer: 'Ospite',
}

export const hasRole = (role: Role | null, allowed: readonly Role[]): boolean => !!role && allowed.includes(role)

/** Roles that can reach the locker room and see ratings. */
export const TEAM_ROLES: readonly Role[] = ['admin', 'staff', 'player']
export const STAFF_ROLES: readonly Role[] = ['admin', 'staff']
export const ALL_ROLES: readonly Role[] = ['admin', 'staff', 'player', 'viewer']
