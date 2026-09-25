// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import { useWatchlist } from '../app/composables/useWatchlist'
import type { WatchlistEntry } from '../app/types/movie'

const addToast = vi.hoisted(() => vi.fn())
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addToast }) }))

const movie = { id: 7, title: 'A Film', poster_path: null, release_date: '2024-01-01', vote_average: 8 }
const entry: WatchlistEntry = { ...movie, added_at: '2024-01-01T00:00:00.000Z' }
let watchlist: ReturnType<typeof useWatchlist>

const Host = defineComponent({
  setup() {
    watchlist = useWatchlist()
    return () => h('div')
  },
})

beforeEach(() => {
  addToast.mockReset()
  vi.stubGlobal('useAuth', () => ({ user: shallowRef({ id: 'user-1' }), ready: shallowRef(true), refresh: vi.fn() }))
  vi.stubGlobal('useRoute', () => ({ fullPath: '/' }))
})
afterEach(() => vi.unstubAllGlobals())

it('shows an added movie immediately, then confirms it with a toast', async () => {
  let finishPost!: (saved: WatchlistEntry) => void
  const post = new Promise<WatchlistEntry>(resolve => { finishPost = resolve })
  vi.stubGlobal('$fetch', vi.fn((url: string) => url === '/api/watchlist' ? Promise.resolve([]) : post))
  const wrapper = mount(Host)
  await flushPromises()

  const pending = watchlist.toggle(movie)
  expect(watchlist.savedIds.value.has(movie.id)).toBe(true)
  finishPost(entry)
  await pending
  expect(watchlist.entries.value).toEqual([entry])
  expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', summary: 'Added to watchlist' }))
  wrapper.unmount()
})

it('accepts a second click immediately and sends requests in order', async () => {
  let finishPost!: (saved: WatchlistEntry) => void
  const post = new Promise<WatchlistEntry>(resolve => { finishPost = resolve })
  const fetch = vi.fn((url: string, options?: { method?: string }) => {
    if (url === '/api/watchlist') return Promise.resolve([])
    return options?.method === 'POST' ? post : Promise.resolve({ id: movie.id })
  })
  vi.stubGlobal('$fetch', fetch)
  const wrapper = mount(Host)
  await flushPromises()

  const adding = watchlist.toggle(movie)
  expect(watchlist.savedIds.value.has(movie.id)).toBe(true)
  const removing = watchlist.toggle(movie)
  expect(watchlist.savedIds.value.has(movie.id)).toBe(false)
  expect(fetch.mock.calls.filter(([url]) => url === `/api/watchlist/${movie.id}`)).toHaveLength(1)
  finishPost(entry)
  await Promise.all([adding, removing])
  expect(fetch.mock.calls.filter(([url]) => url === `/api/watchlist/${movie.id}`)).toHaveLength(2)
  expect(watchlist.savedIds.value.has(movie.id)).toBe(false)
  expect(addToast).toHaveBeenCalledOnce()
  expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ summary: 'Removed from watchlist' }))
  wrapper.unmount()
})

it('removes immediately and restores the movie if the request fails', async () => {
  let failDelete!: (reason: Error) => void
  const deletion = new Promise<never>((_, reject) => { failDelete = reject })
  vi.stubGlobal('$fetch', vi.fn((url: string) => url === '/api/watchlist' ? Promise.resolve([entry]) : deletion))
  const wrapper = mount(Host)
  await flushPromises()

  const pending = watchlist.toggle(movie)
  expect(watchlist.savedIds.value.has(movie.id)).toBe(false)
  failDelete(new Error('Network error'))
  await pending
  expect(watchlist.entries.value).toEqual([entry])
  expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', summary: 'Watchlist update failed' }))
  wrapper.unmount()
})

it('undoes an optimistic add if saving fails', async () => {
  let failPost!: (reason: Error) => void
  const post = new Promise<never>((_, reject) => { failPost = reject })
  vi.stubGlobal('$fetch', vi.fn((url: string) => url === '/api/watchlist' ? Promise.resolve([]) : post))
  const wrapper = mount(Host)
  await flushPromises()

  const pending = watchlist.toggle(movie)
  expect(watchlist.savedIds.value.has(movie.id)).toBe(true)
  failPost(new Error('Network error'))
  await pending
  expect(watchlist.savedIds.value.has(movie.id)).toBe(false)
  expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }))
  wrapper.unmount()
})
