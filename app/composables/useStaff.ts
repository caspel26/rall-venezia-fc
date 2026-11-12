import type { Database } from '~/types/database'

export function useStaff() {
  const client = useSupabaseClient<Database>()
  return useAsyncData('staff', async () =>
    ((await client.from('staff_members').select('*').order('sort_order')).data ?? []), { lazy: true })
}
