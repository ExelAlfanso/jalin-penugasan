import { and, eq } from 'drizzle-orm'
import { db } from '../../db'
import { watchlist } from '../../db/schema'
import { isMovieId } from '../../utils/movie'
import { watchlistUserId } from '../../utils/watchlist'

export default defineEventHandler(async (event) => {
  const userId = watchlistUserId(event)
  const id = getRouterParam(event, 'id') ?? ''
  if (!isMovieId(id) || Number(id) > 2147483647) throw createError({ statusCode: 400, statusMessage: 'Invalid movie ID.' })

  await db.delete(watchlist).where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, Number(id))))
  return { id: Number(id) }
})
