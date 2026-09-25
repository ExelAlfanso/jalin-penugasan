import { computed, shallowRef, watch } from 'vue'
import type { WatchlistEntry } from '../types/movie'

export function useWatchlist() {
  const route = useRoute()
  const { user, ready, refresh: refreshAuth } = useAuth()
  const entries = shallowRef<WatchlistEntry[]>([])
  const loading = shallowRef(false)
  const busyId = shallowRef<number | null>(null)
  const error = shallowRef('')
  const savedIds = computed(() => new Set(entries.value.map(movie => movie.id)))

  async function refresh() {
    const userId = user.value?.id
    if (!userId) { entries.value = []; return }
    loading.value = true
    error.value = ''
    try {
      const result = await $fetch<WatchlistEntry[]>('/api/watchlist')
      if (user.value?.id === userId) entries.value = result
    } catch {
      if (user.value?.id === userId) error.value = 'Watchlist could not be loaded. Please try again.'
    } finally {
      loading.value = false
    }
  }

  watch(user, current => {
    entries.value = []
    error.value = ''
    if (current) void refresh()
  }, { immediate: true })

  async function toggle(id: number) {
    if (!ready.value) await refreshAuth().catch(() => {})
    if (!user.value) return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    if (busyId.value !== null) return

    busyId.value = id
    error.value = ''
    try {
      if (savedIds.value.has(id)) {
        await $fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
        entries.value = entries.value.filter(movie => movie.id !== id)
      } else {
        const movie = await $fetch<WatchlistEntry>(`/api/watchlist/${id}`, { method: 'POST' })
        entries.value = [movie, ...entries.value.filter(item => item.id !== id)]
      }
    } catch {
      error.value = 'Watchlist could not be updated. Please try again.'
    } finally {
      busyId.value = null
    }
  }

  return { entries, savedIds, loading, busyId, error, refresh, toggle }
}
