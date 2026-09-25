import { computed, shallowRef, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { MovieSummary, WatchlistEntry } from '../types/movie'

export function useWatchlist() {
  const route = useRoute()
  const { user, ready, refresh: refreshAuth } = useAuth()
  const toast = useToast()
  const entries = shallowRef<WatchlistEntry[]>([])
  const loading = shallowRef(false)
  const busyId = shallowRef<number | null>(null)
  const error = shallowRef('')
  const savedIds = computed(() => new Set(entries.value.map(movie => movie.id)))
  let refreshPromise: Promise<void> | null = null

  async function refresh() {
    const userId = user.value?.id
    if (!userId) { entries.value = []; return }
    if (refreshPromise) return refreshPromise
    loading.value = true
    error.value = ''
    const request = (async () => {
      try {
        const result = await $fetch<WatchlistEntry[]>('/api/watchlist')
        if (user.value?.id === userId && busyId.value === null) entries.value = result
      } catch {
        if (user.value?.id === userId) error.value = 'Watchlist could not be loaded. Please try again.'
      } finally {
        if (user.value?.id === userId) loading.value = false
      }
    })()
    refreshPromise = request
    await request
    if (refreshPromise === request) refreshPromise = null
  }

  watch(user, current => {
    entries.value = []
    error.value = ''
    refreshPromise = null
    if (current) void refresh()
  }, { immediate: true })

  async function toggle(movie: MovieSummary) {
    if (!ready.value) await refreshAuth().catch(() => {})
    if (!user.value) return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    if (refreshPromise) await refreshPromise
    if (!user.value) return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    if (busyId.value !== null) return

    const userId = user.value.id
    const before = entries.value
    const removing = savedIds.value.has(movie.id)
    busyId.value = movie.id
    error.value = ''
    entries.value = removing
      ? before.filter(item => item.id !== movie.id)
      : [{ ...movie, added_at: new Date().toISOString() }, ...before]
    try {
      if (removing) {
        await $fetch(`/api/watchlist/${movie.id}`, { method: 'DELETE' })
      } else {
        const saved = await $fetch<WatchlistEntry>(`/api/watchlist/${movie.id}`, { method: 'POST' })
        if (user.value?.id === userId) entries.value = entries.value.map(item => item.id === movie.id ? saved : item)
      }
      if (user.value?.id === userId) toast.add({ severity: 'success', summary: removing ? 'Removed from watchlist' : 'Added to watchlist', detail: movie.title, life: 3000 })
    } catch {
      if (user.value?.id === userId) {
        entries.value = before
        toast.add({ severity: 'error', summary: 'Watchlist update failed', detail: 'Your change was undone. Please try again.', life: 5000 })
      }
    } finally {
      busyId.value = null
    }
  }

  return { entries, savedIds, loading, busyId, error, refresh, toggle }
}
