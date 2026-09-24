<script setup lang="ts">
import { computed } from 'vue'
import type { MoviePage } from '../types/movie'

definePageMeta({ middleware: 'auth' })
const route = useRoute()
const router = useRouter()
const page = computed(() => {
  const value = Number(route.query.page)
  return Number.isInteger(value) && value > 0 ? Math.min(value, 500) : 1
})
const { data, pending, error, refresh } = await useFetch<MoviePage>('/api/watchlist', { query: computed(() => ({ page: page.value })) })

function changePage(event: { page: number }) {
  router.push({ path: '/watchlist', query: { page: event.page + 1 } })
}

useHead({ title: 'Watchlist | Frame' })
</script>

<template>
  <main id="main" class="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
    <div class="mb-10 border-b border-black/15 pb-8">
      <h1 class="text-5xl font-bold leading-none sm:text-7xl">Your watchlist</h1>
      <p class="mt-4 text-black/65">Films saved to your TMDB account.</p>
    </div>
    <div role="status" aria-live="polite">
      <p v-if="pending">Loading your watchlist…</p>
      <div v-else-if="error" class="border border-black/20 bg-[#fafafa] p-6">
        <p>Watchlist could not be loaded. Please try again.</p>
        <Button class="mt-4" label="Try again" @click="refresh" />
      </div>
      <div v-else-if="!data?.results.length" class="border border-black/20 bg-[#fafafa] p-6">
        <p>Your watchlist is empty. Add films on TMDB to see them here.</p>
        <NuxtLink to="/" class="mt-4 inline-block font-semibold underline decoration-[#f5c518] decoration-4 underline-offset-4">Browse films</NuxtLink>
      </div>
      <p v-else class="mb-5 text-sm text-black/65">{{ data.total_results.toLocaleString('en-US') }} saved films</p>
    </div>
    <MovieGrid v-if="data?.results.length && !pending && !error" :movies="data.results" />
    <Paginator v-if="data && data.total_pages > 1 && !pending && !error" class="mt-12" :first="(page - 1) * 20" :rows="20" :total-records="Math.min(data.total_results, 10000)" @page="changePage" />
  </main>
</template>
