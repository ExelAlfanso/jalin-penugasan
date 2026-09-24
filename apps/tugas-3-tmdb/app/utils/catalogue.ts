export function catalogueQuery(mode: 'search' | 'genre' | 'page', value: string | number | null, current: { q: string; genre: number | null }) {
  if (mode === 'search') return value ? { q: String(value) } : {}
  if (mode === 'genre') return value ? { genre: String(value) } : {}
  return { ...(current.q ? { q: current.q } : current.genre ? { genre: String(current.genre) } : {}), page: String(value) }
}
