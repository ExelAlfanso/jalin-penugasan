import { desc, eq } from 'drizzle-orm'
import { withDb } from '../../db'
import { watchlist } from '../../db/schema'
import { watchlistUserId } from '../../utils/watchlist'

export default defineEventHandler(async (event) => {
  const userId = watchlistUserId(event)
  const rows = await withDb((db) => db.select({
    id: watchlist.movieId,
    title: watchlist.title,
    poster_path: watchlist.posterPath,
    release_date: watchlist.releaseDate,
    vote_average: watchlist.voteAverage,
    added_at: watchlist.createdAt,
  }).from(watchlist).where(eq(watchlist.userId, userId)).orderBy(desc(watchlist.createdAt)))
  return rows.map(({ added_at, ...movie }) => ({ ...movie, added_at: added_at.toISOString() }))
})
