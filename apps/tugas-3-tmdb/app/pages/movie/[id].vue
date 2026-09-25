<script setup lang="ts">
  import { computed, shallowRef } from "vue";
  import type { MovieDetail } from "../../types/movie";

  const route = useRoute();
  const id = computed(() => String(route.params.id ?? ""));
  const {
    data: movie,
    pending,
    error,
    refresh,
  } = await useFetch<MovieDetail>(() => `/api/movies/${id.value}`, { watch: [id] });
  const trailerOpen = shallowRef(false);
  const { savedIds, busyId, error: watchlistError, toggle } = useWatchlist();
  const errorText = computed(() =>
    error.value?.statusCode === 404
      ? "Movie not found. Check the link or browse other films."
      : error.value?.statusCode === 503
        ? "TMDB is not configured. Add NUXT_TMDB_API_KEY to the server environment and try again."
        : "Movie details could not be loaded. Please try again.",
  );
  useHead({
    title: computed(() => (movie.value ? `${movie.value.title} | Frame` : "Film | Frame")),
  });
</script>

<template>
  <main id="main" class="w-full">
    <div class="mx-auto max-w-7xl px-5 pt-8 pb-4 sm:px-8">
      <NuxtLink
        to="/"
        class="text-sm font-semibold underline decoration-[#f5c518] decoration-2 underline-offset-4 hover:decoration-black"
        >← All Films</NuxtLink
      >
    </div>
    <div
      v-if="pending"
      class="mx-auto max-w-7xl px-5 py-12 sm:px-8"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Loading movie details…</span>
      <Skeleton width="100%" height="18rem" />
      <Skeleton width="50%" height="3rem" class="mt-8" />
      <Skeleton width="75%" height="1rem" class="mt-4" />
    </div>
    <div
      v-else-if="error || !movie"
      class="mx-auto max-w-7xl px-5 py-20 sm:px-8"
      role="status"
      aria-live="polite"
    >
      <h1 class="text-4xl font-semibold">Film Unavailable</h1>
      <p class="mt-3">{{ errorText }}</p>
      <Button v-if="error?.statusCode !== 404" class="mt-5" label="Try Again" @click="refresh()" />
    </div>
    <template v-else>
      <p v-if="watchlistError" class="mx-auto max-w-7xl px-5 text-red-700 sm:px-8" role="alert">{{ watchlistError }}</p>
      <MovieInformation :movie="movie" :saved="savedIds.has(movie.id)" :saving="busyId === movie.id" @trailer="trailerOpen = true" @watchlist="toggle(movie)" />
      <TrailerDialog v-model="trailerOpen" :trailer="movie.trailer" :title="movie.title" />
    </template>
  </main>
</template>
