import { createError, deleteCookie, getCookie, getRequestURL, type H3Event } from 'h3'

export const SESSION_COOKIE = 'frame_tmdb_session'
export const REQUEST_COOKIE = 'frame_tmdb_request'
export const RETURN_COOKIE = 'frame_tmdb_return'

export function authCookieOptions(event: H3Event) {
  return { httpOnly: true, sameSite: 'lax' as const, secure: getRequestURL(event).protocol === 'https:', path: '/' }
}

export function clearAuthCookies(event: H3Event) {
  for (const name of [SESSION_COOKIE, REQUEST_COOKIE, RETURN_COOKIE]) deleteCookie(event, name, { path: '/' })
}

export async function currentUser(event: H3Event) {
  const session = getCookie(event, SESSION_COOKIE)
  if (!session) return null

  try {
    const account = await tmdb<{ id: number; username: string }>('/account', { session_id: session })
    if (!Number.isSafeInteger(account.id) || account.id < 1 || typeof account.username !== 'string') {
      throw createError({ statusCode: 502, statusMessage: 'TMDB returned invalid account data.' })
    }
    return { id: account.id, username: account.username }
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 401) {
      clearAuthCookies(event)
      return null
    }
    throw error
  }
}
