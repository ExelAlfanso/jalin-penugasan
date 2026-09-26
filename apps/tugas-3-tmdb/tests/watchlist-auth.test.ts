import { beforeEach, expect, it, vi } from 'vitest'

const getSession = vi.fn()
const isAuthConfigured = vi.fn(() => true)

vi.mock('../server/auth', () => ({ createAuth: () => ({ api: { getSession } }) }))
vi.mock('../server/db', () => ({ withDb: (run: (db: object) => Promise<unknown>) => run({}) }))
vi.mock('../server/utils/auth-config', () => ({ isAuthConfigured }))

beforeEach(() => {
  vi.resetModules()
  getSession.mockReset()
  isAuthConfigured.mockReturnValue(true)
  vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
  vi.stubGlobal('getRequestURL', (event: { node: { req: { url: string } } }) => new URL(event.node.req.url, 'http://localhost'))
  vi.stubGlobal('setHeader', (event: { node: { res: { setHeader: (name: string, value: string) => void } } }, name: string, value: string) => event.node.res.setHeader(name, value))
  vi.stubGlobal('createError', (options: { statusCode: number; statusMessage: string }) => Object.assign(new Error(options.statusMessage), options))
})

it('rejects anonymous watchlist requests before any database handler runs', async () => {
  const { default: middleware } = await import('../server/middleware/watchlist-auth')
  getSession.mockResolvedValue(null)
  const event = { node: { req: { url: '/api/watchlist/42', headers: { host: 'localhost' } }, res: { setHeader: vi.fn() } }, headers: new Headers(), context: {} }
  await expect(middleware(event as never)).rejects.toMatchObject({ statusCode: 401 })
  expect(getSession).toHaveBeenCalledOnce()
})

it('passes the verified user ID to watchlist handlers', async () => {
  const { default: middleware } = await import('../server/middleware/watchlist-auth')
  getSession.mockResolvedValue({ user: { id: 'user-1' } })
  const event = { node: { req: { url: '/api/watchlist', headers: { host: 'localhost' } }, res: { setHeader: vi.fn() } }, headers: new Headers(), context: {} as Record<string, unknown> }
  await middleware(event as never)
  expect(event.context.watchlistUserId).toBe('user-1')
  expect(event.node.res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-store')
})
