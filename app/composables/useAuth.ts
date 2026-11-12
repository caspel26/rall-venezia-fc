import type { Database } from '~/types/database'
import type { Role } from '~/types/domain'

/** Session + role. The role is read from the database under RLS (own row), never from the browser. */
export function useAuth() {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const role = useState<Role | null>('auth-role', () => null)
  const roleLoadedFor = useState<string | null>('auth-role-for', () => null)

  async function loadRole(force = false) {
    const id = user.value?.sub ?? null
    if (!id) {
      role.value = null
      roleLoadedFor.value = null
      return null
    }
    if (!force && roleLoadedFor.value === id) return role.value
    const { data } = await client.from('user_roles').select('role').eq('user_id', id).maybeSingle()
    role.value = (data?.role as Role | undefined) ?? null
    roleLoadedFor.value = id
    return role.value
  }

  async function signOut() {
    await client.auth.signOut()
    role.value = null
    roleLoadedFor.value = null
    await navigateTo('/login')
  }

  return { user, role, loadRole, signOut }
}
