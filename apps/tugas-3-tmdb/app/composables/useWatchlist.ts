import { computed, shallowRef, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { MovieSummary, WatchlistEntry } from '../types/movie'

export function useWatchlist() {
  const route = useRoute()
  const { user, ready, refresh: refreshAuth } = useAuth()
  const toast = useToast()
  const entries = shallowRef<WatchlistEntry[]>([])
  const loading = shallowRef(false)
  const error = shallowRef('')
  const savedIds = computed(() => new Set(entries.value.map(movie => movie.id)))
  const operations = new Map<number, Promise<void>>()
  const revisions = new Map<number, number>()
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
        if (user.value?.id === userId && operations.size === 0) entries.value = result
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
    operations.clear()
    if (current) void refresh()
  }, { immediate: true })

  async function toggle(movie: MovieSummary) {
    if (!ready.value) await refreshAuth().catch(() => {})
    if (!user.value) return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    if (refreshPromise) await refreshPromise
    if (!user.value) return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    const userId = user.value.id
    const before = entries.value
    const removing = savedIds.value.has(movie.id)
    const original = before.find(item => item.id === movie.id)
    const originalIndex = before.findIndex(item => item.id === movie.id)
    const revision = (revisions.get(movie.id) ?? 0) + 1
    revisions.set(movie.id, revision)
    error.value = ''
    entries.value = removing
      ? before.filter(item => item.id !== movie.id)
      : [{ ...movie, added_at: new Date().toISOString() }, ...before]
    const previous = operations.get(movie.id)
    const operation = (async () => {
      if (previous) await previous
      if (user.value?.id !== userId) return
      const isLatest = () => user.value?.id === userId && revisions.get(movie.id) === revision
      try {
        if (removing) {
          await $fetch(`/api/watchlist/${movie.id}`, { method: 'DELETE' })
        } else {
          const saved = await $fetch<WatchlistEntry>(`/api/watchlist/${movie.id}`, { method: 'POST' })
          if (isLatest()) entries.value = entries.value.map(item => item.id === movie.id ? saved : item)
        }
        if (isLatest()) toast.add({ severity: 'success', summary: removing ? 'Removed from watchlist' : 'Added to watchlist', detail: movie.title, life: 3000 })
      } catch {
        if (isLatest()) {
          if (removing && original) {
            const restored = entries.value.filter(item => item.id !== movie.id)
            restored.splice(originalIndex, 0, original)
            entries.value = restored
          } else {
            entries.value = entries.value.filter(item => item.id !== movie.id)
          }
          toast.add({ severity: 'error', summary: 'Watchlist update failed', detail: 'Your change was undone. Please try again.', life: 5000 })
        }
      }
    })()
    operations.set(movie.id, operation)
    await operation
    if (operations.get(movie.id) === operation) operations.delete(movie.id)
  }

  return { entries, savedIds, loading, error, refresh, toggle }
}
