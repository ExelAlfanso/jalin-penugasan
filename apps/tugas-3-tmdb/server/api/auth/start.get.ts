import { getQuery, getRequestURL, sendRedirect, setCookie, setHeader } from 'h3'
import { authCookieOptions, REQUEST_COOKIE, RETURN_COOKIE } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const returnTo = getQuery(event).redirect === '/watchlist' ? '/watchlist' : '/dashboard'

  try {
    const { request_token } = await tmdb<{ request_token: string }>('/authentication/token/new')
    if (typeof request_token !== 'string' || !request_token) throw new Error('TMDB returned no request token.')
    const options = { ...authCookieOptions(event), maxAge: 60 * 60 }
    setCookie(event, REQUEST_COOKIE, request_token, options)
    setCookie(event, RETURN_COOKIE, returnTo, options)

    const approval = new URL(`https://www.themoviedb.org/authenticate/${encodeURIComponent(request_token)}`)
    approval.searchParams.set('redirect_to', new URL('/api/auth/callback', getRequestURL(event)).toString())
    return sendRedirect(event, approval.toString(), 302)
  } catch {
    return sendRedirect(event, '/login?error=unavailable', 302)
  }
})
