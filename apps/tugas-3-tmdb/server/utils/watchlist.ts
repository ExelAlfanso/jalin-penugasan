import type { H3Event } from 'h3'

export function watchlistUserId(event: H3Event): string {
  const id = event.context.watchlistUserId
  if (typeof id !== 'string') throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  return id
}
