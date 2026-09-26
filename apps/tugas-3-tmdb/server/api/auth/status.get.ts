import { setHeader } from 'h3'
import { isAuthConfigured } from '../../utils/auth-config'
import { withDb } from '../../db'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  if (!isAuthConfigured()) return { user: null, configured: false }
  const { createAuth } = await import('../../auth')
  const session = await withDb((db) => createAuth(db).api.getSession({ headers: event.headers }))
  return { user: session?.user ?? null, configured: true }
})
