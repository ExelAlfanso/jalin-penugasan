import { getCookie, setHeader } from 'h3'
import { clearAuthCookies, SESSION_COOKIE } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const session = getCookie(event, SESSION_COOKIE)
  clearAuthCookies(event)

  if (session) {
    try {
      await tmdb('/authentication/session', {}, { method: 'DELETE', body: { session_id: session } })
    } catch {
      return { loggedOut: true, remoteSessionRevoked: false }
    }
  }

  return { loggedOut: true, remoteSessionRevoked: true }
})
