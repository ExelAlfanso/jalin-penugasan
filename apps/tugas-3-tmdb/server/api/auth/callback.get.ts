import { deleteCookie, getCookie, getQuery, sendRedirect, setCookie, setHeader } from 'h3'
import { authCookieOptions, REQUEST_COOKIE, RETURN_COOKIE, SESSION_COOKIE } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const pending = getCookie(event, REQUEST_COOKIE)
  const returnTo = getCookie(event, RETURN_COOKIE) === '/watchlist' ? '/watchlist' : '/dashboard'
  const query = getQuery(event)
  deleteCookie(event, REQUEST_COOKIE, { path: '/' })
  deleteCookie(event, RETURN_COOKIE, { path: '/' })

  if (!pending || (query.request_token && query.request_token !== pending) || query.approved === 'false') {
    return sendRedirect(event, '/login?error=denied', 302)
  }

  try {
    const { session_id } = await tmdb<{ session_id: string }>('/authentication/session/new', {}, {
      method: 'POST', body: { request_token: pending },
    })
    if (typeof session_id !== 'string' || !session_id) return sendRedirect(event, '/login?error=unavailable', 302)
    setCookie(event, SESSION_COOKIE, session_id, { ...authCookieOptions(event), maxAge: 60 * 60 * 24 * 7 })
    return sendRedirect(event, returnTo, 302)
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    return sendRedirect(event, status === 502 || status === 503 ? '/login?error=unavailable' : '/login?error=denied', 302)
  }
})
