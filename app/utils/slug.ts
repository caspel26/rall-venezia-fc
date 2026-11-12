/** "Dàniele  Nappo" -> "daniele-nappo" (accents stripped, matches the DB slug check). */
export function slugify(...parts: string[]): string {
  return parts.join(' ').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
