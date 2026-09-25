import { createError, toWebRequest } from 'h3'
import { isAuthConfigured } from '../../utils/auth-config'

export default defineEventHandler(async (event) => {
  if (!isAuthConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Google sign in is not configured.' })
  }
  const { auth } = await import('../../auth')
  return auth.handler(toWebRequest(event))
})
