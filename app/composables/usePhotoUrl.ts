/** Short-lived signed URL for a private storage object; null until loaded or when there is no path. */
export function usePhotoUrl(bucket: Ref<string> | string, path: Ref<string | null | undefined>) {
  const client = useSupabaseClient()
  const url = ref<string | null>(null)
  const load = async () => {
    const p = path.value
    if (!p) { url.value = null; return }
    const { data } = await client.storage.from(toValue(bucket)).createSignedUrl(p, 3600)
    url.value = data?.signedUrl ?? null
  }
  onMounted(load)
  watch(path, load)
  return url
}
