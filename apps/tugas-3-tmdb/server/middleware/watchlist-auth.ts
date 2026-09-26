import { isAuthConfigured } from '../utils/auth-config'
import { withDb } from '../db'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (path !== '/api/watchlist' && !path.startsWith('/api/watchlist/')) return

  setHeader(event, 'Cache-Control', 'private, no-store')
  if (!isAuthConfigured()) throw createError({ statusCode: 503, statusMessage: 'Sign in is not configured.' })

  const { createAuth } = await import('../auth')
  const session = await withDb((db) => createAuth(db).api.getSession({ headers: event.headers }))
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  event.context.watchlistUserId = session.user.id
})
