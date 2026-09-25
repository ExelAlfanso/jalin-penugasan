import type { Movie } from '../../../app/types/movie'
import { db } from '../../db'
import { watchlist } from '../../db/schema'
import { isMovieId } from '../../utils/movie'
import { tmdb } from '../../utils/tmdb'
import { watchlistUserId } from '../../utils/watchlist'

export default defineEventHandler(async (event) => {
  const userId = watchlistUserId(event)
  const id = getRouterParam(event, 'id') ?? ''
  if (!isMovieId(id) || Number(id) > 2147483647) throw createError({ statusCode: 400, statusMessage: 'Invalid movie ID.' })

  const movie = await tmdb<Movie>(`/movie/${id}`)
  const values = {
    userId,
    movieId: Number(id),
    title: movie.title || 'Untitled film',
    posterPath: movie.poster_path ?? null,
    releaseDate: movie.release_date ?? '',
    voteAverage: Number.isFinite(movie.vote_average) ? movie.vote_average : 0,
  }
  const [row] = await db.insert(watchlist).values(values).onConflictDoUpdate({
    target: [watchlist.userId, watchlist.movieId],
    set: { title: values.title, posterPath: values.posterPath, releaseDate: values.releaseDate, voteAverage: values.voteAverage },
  }).returning()
  if (!row) throw createError({ statusCode: 500, statusMessage: 'Could not save movie.' })
  return { id: row.movieId, title: row.title, poster_path: row.posterPath, release_date: row.releaseDate, vote_average: row.voteAverage, added_at: row.createdAt.toISOString() }
})
