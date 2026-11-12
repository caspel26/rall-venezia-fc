import type { IconName } from '~/components/AppIcon.vue'
import { hasRole, STAFF_ROLES, TEAM_ROLES, type Role } from '~/types/domain'

export interface NavItem {
  to: string
  label: string
  icon: IconName
  /** Roles that see the item; undefined = everyone signed in. */
  roles?: readonly Role[]
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/matches', label: 'Partite', icon: 'matches' },
  { to: '/team', label: 'Squadra', icon: 'team' },
  { to: '/stats', label: 'Stats', icon: 'stats' },
  { to: '/clubhouse', label: 'Spogliatoio', icon: 'locker', roles: TEAM_ROLES },
]

export const SECONDARY_NAV: NavItem[] = [
  { to: '/news', label: 'Gazzetta', icon: 'news' },
  { to: '/admin', label: 'Admin', icon: 'shield', roles: STAFF_ROLES },
]

/** Nav entries the current role may see (UX only; RLS decides what data exists). */
export function useNav() {
  const { role } = useAuth()
  const visible = <T extends { roles?: readonly Role[] }>(items: T[]) =>
    items.filter((i) => !i.roles || hasRole(role.value, i.roles))
  return {
    primary: computed(() => visible(PRIMARY_NAV)),
    secondary: computed(() => visible(SECONDARY_NAV)),
  }
}

export function isActive(path: string, to: string) {
  return to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`)
}
