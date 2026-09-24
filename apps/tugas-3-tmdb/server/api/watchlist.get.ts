import { createError, getCookie, getQuery, setHeader } from 'h3'
import type { MoviePage } from '../../app/types/movie'
import { currentUser, SESSION_COOKIE } from '../utils/auth'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const user = await currentUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to view your watchlist.' })

  const requestedPage = Number(getQuery(event).page)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 500) : 1
  return await tmdb<MoviePage>(`/account/${user.id}/watchlist/movies`, {
    session_id: getCookie(event, SESSION_COOKIE)!, page, sort_by: 'created_at.desc',
  })
})
