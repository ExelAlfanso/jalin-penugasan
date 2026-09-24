import { setHeader } from 'h3'
import { currentUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  return { user: await currentUser(event) }
})
