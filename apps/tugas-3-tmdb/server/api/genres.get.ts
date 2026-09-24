import type { Genre } from '../../app/types/movie'

export default defineEventHandler(async () => {
  const data = await tmdb<{ genres: Genre[] }>('/genre/movie/list')
  return data.genres
})
