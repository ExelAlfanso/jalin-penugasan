import type { MoviePage } from '../../app/types/movie'

export default defineEventHandler(async (event) => {
  const { path, params } = movieRequest(getQuery(event))
  return await tmdb<MoviePage>(path, params)
})
