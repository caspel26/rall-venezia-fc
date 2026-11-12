import { hasRole, type Role } from '~/types/domain'

declare module '#app' {
  interface PageMeta {
    /** Roles allowed on this route. UX guard only; RLS is the real enforcement. */
    roles?: readonly Role[]
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, role, loadRole } = useAuth()
  if (!user.value) return
  await loadRole()
  const allowed = to.meta.roles
  if (allowed && !hasRole(role.value, allowed)) {
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Accesso negato' }))
  }
})
