import { setHeader } from 'h3'
import { isAuthConfigured } from '../../utils/auth-config'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  if (!isAuthConfigured()) return { user: null, configured: false }
  const { auth } = await import('../../auth')
  const session = await auth.api.getSession({ headers: event.headers })
  return { user: session?.user ?? null, configured: true }
})
