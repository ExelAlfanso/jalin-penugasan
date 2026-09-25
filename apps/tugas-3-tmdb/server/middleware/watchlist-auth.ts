import { isAuthConfigured } from '../utils/auth-config'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (path !== '/api/watchlist' && !path.startsWith('/api/watchlist/')) return

  setHeader(event, 'Cache-Control', 'private, no-store')
  if (!isAuthConfigured()) throw createError({ statusCode: 503, statusMessage: 'Sign in is not configured.' })

  const { auth } = await import('../auth')
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  event.context.watchlistUserId = session.user.id
})
