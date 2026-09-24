import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => vi.unstubAllGlobals())

it('blocks protected routes until a TMDB session is valid', async () => {
  const navigateTo = vi.fn((destination: unknown) => destination)
  const refresh = vi.fn().mockResolvedValue(null)
  vi.stubGlobal('defineNuxtRouteMiddleware', (guard: unknown) => guard)
  vi.stubGlobal('navigateTo', navigateTo)
  vi.stubGlobal('useAuth', () => ({ refresh }))

  const { default: guard } = await import('../app/middleware/auth')
  expect(await guard({ path: '/watchlist' } as never, {} as never)).toEqual({
    path: '/login', query: { redirect: '/watchlist' },
  })

  refresh.mockResolvedValue({ id: 1, username: 'viewer' })
  expect(await guard({ path: '/dashboard' } as never, {} as never)).toBeUndefined()
  expect(navigateTo).toHaveBeenCalledTimes(1)
})
