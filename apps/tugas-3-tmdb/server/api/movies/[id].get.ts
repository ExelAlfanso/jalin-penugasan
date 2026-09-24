import type { MovieDetail } from '../../../app/types/movie'
import type { Video } from '../../utils/movie'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  if (!isMovieId(id)) throw createError({ statusCode: 404, statusMessage: 'Movie not found.' })
  const movie = await tmdb<MovieDetail & { videos: { results: Video[] } }>(`/movie/${id}`, { append_to_response: 'credits,videos' })
  return { ...movie, credits: { cast: movie.credits?.cast?.slice(0, 12) ?? [] }, trailer: selectTrailer(movie.videos?.results ?? []) }
})
