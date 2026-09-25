<script setup lang="ts">
import { computed } from 'vue'
import type { Genre, MoviePage } from '../types/movie'
import { catalogueQuery } from '../utils/catalogue'

const route = useRoute()
const router = useRouter()
const query = computed(() => typeof route.query.q === 'string' ? route.query.q : '')
const genre = computed(() => /^[1-9]\d*$/.test(String(route.query.genre ?? '')) ? Number(route.query.genre) : null)
const page = computed(() => {
  const value = Number(route.query.page)
  return Number.isInteger(value) && value > 0 ? Math.min(value, 500) : 1
})
const params = computed(() => ({ ...(query.value ? { q: query.value } : genre.value ? { genre: genre.value } : {}), page: page.value }))
const { data: movies, pending, error, refresh } = await useFetch<MoviePage>('/api/movies', { query: params, watch: [params] })
const { data: genres, error: genreError, refresh: refreshGenres } = await useFetch<Genre[]>('/api/genres')
const { savedIds, busyId, error: watchlistError, toggle } = useWatchlist()
const heading = computed(() => query.value ? `Search results for “${query.value}”` : genre.value ? `${genres.value?.find(item => item.id === genre.value)?.name ?? 'Genre'} films` : 'Popular films')
const errorText = computed(() => (error.value?.statusCode === 503 || genreError.value?.statusCode === 503) ? 'TMDB is not configured. Add NUXT_TMDB_API_KEY to the server environment and try again.' : 'Films could not be loaded. Please try again.')

function search(value: string) { router.push({ path: '/', query: catalogueQuery('search', value, { q: query.value, genre: genre.value }) }) }
function selectGenre(value: number | null) { router.push({ path: '/', query: catalogueQuery('genre', value, { q: query.value, genre: genre.value }) }) }
function changePage(event: { page: number }) { router.push({ path: '/', query: catalogueQuery('page', event.page + 1, { q: query.value, genre: genre.value }) }) }
function retry() { refresh(); refreshGenres() }

useHead({ title: 'Popular Films | Frame', meta: [{ name: 'description', content: 'Explore popular films, search by title, and browse by genre.' }] })
</script>

<template>
  <main id="main" class="mx-auto w-full max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
    <div class="mb-10 border-b border-black/15 pb-8">
      <h1 class="text-5xl sm:text-7xl font-bold leading-none text-balance">{{ heading }}</h1>
      <p class="mt-4 max-w-xl text-black/65">Find your next film by title or genre.</p>
    </div>
    <MovieFilters :query="query" :genre="genre" :genres="genres ?? []" :busy="pending" @search="search" @genre="selectGenre" />
    <p v-if="watchlistError" class="mt-6 text-red-700" role="alert">{{ watchlistError }}</p>
    <div class="mt-10" role="status" aria-live="polite">
      <p v-if="pending" class="sr-only">Loading films…</p>
      <div v-else-if="error || genreError" class="border border-black/20 bg-[#fafafa] p-6">
        <p>{{ errorText }}</p>
        <Button class="mt-4" label="Try Again" @click="retry" />
      </div>
      <div v-else-if="!movies?.results.length" class="border border-black/20 bg-[#fafafa] p-6">
        <p>No films found. Try another title or genre.</p>
        <Button class="mt-4" label="Show Popular Films" @click="search('')" />
      </div>
      <template v-else>
        <p class="mb-5 text-sm text-black/65 tabular">{{ movies.total_results.toLocaleString('en-US') }} films</p>
      </template>
    </div>
    <MovieGrid v-if="pending || (movies?.results.length && !error && !genreError)" :movies="movies?.results ?? []" :loading="pending" :saved-ids="savedIds" :busy-id="busyId" @watchlist="toggle" />
    <Paginator v-if="!pending && !error && movies && movies.total_pages > 1" class="mt-12" :first="(page - 1) * 20" :rows="20" :total-records="Math.min(movies.total_results, 10000)" @page="changePage" />
  </main>
</template>
