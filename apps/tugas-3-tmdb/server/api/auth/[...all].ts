import { createError, toWebRequest } from 'h3'
import { isAuthConfigured } from '../../utils/auth-config'
import { withDb } from '../../db'

export default defineEventHandler(async (event) => {
  if (!isAuthConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Google sign in is not configured.' })
  }
  const { createAuth } = await import('../../auth')
  return withDb((db) => createAuth(db).handler(toWebRequest(event)))
})
