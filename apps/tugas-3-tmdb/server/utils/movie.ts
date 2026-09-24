export function movieRequest(query: Record<string, unknown>): { path: string; params: Record<string, string | number> } {
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
  const genre = typeof query.genre === 'string' && /^\d+$/.test(query.genre) ? query.genre : ''
  const rawPage = Number(query.page)
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? Math.min(rawPage, 500) : 1
  if (q) return { path: '/search/movie', params: { query: q, page } }
  if (genre) return { path: '/discover/movie', params: { with_genres: genre, page, sort_by: 'popularity.desc' } }
  return { path: '/movie/popular', params: { page } }
}

export interface Video { key: string; site: string; type: string; official: boolean }

export function selectTrailer(videos: Video[]): string | null {
  const youtube = videos.filter(video => video.site === 'YouTube' && video.type === 'Trailer' && /^[\w-]{11}$/.test(video.key))
  return (youtube.find(video => video.official) ?? youtube[0])?.key ?? null
}

export function isMovieId(value: string): boolean { return /^[1-9]\d*$/.test(value) }
