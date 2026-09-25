<script setup lang="ts">
import type { MovieSummary } from '../../types/movie'
defineProps<{ movies: MovieSummary[]; loading?: boolean; savedIds?: ReadonlySet<number>; busyId?: number | null }>()
const emit = defineEmits<{ watchlist: [movie: MovieSummary] }>()
</script>

<template>
  <div class="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5">
    <template v-if="loading">
      <div v-for="n in 10" :key="n" aria-hidden="true">
        <Skeleton width="100%" class="!aspect-[2/3] !h-auto" />
        <Skeleton width="85%" height="1.5rem" class="mt-3" />
        <Skeleton width="55%" height="1rem" class="mt-2" />
      </div>
    </template>
    <MovieCard v-for="(movie, index) in loading ? [] : movies" :key="movie.id" :movie="movie" :priority="index < 2" :saved="savedIds?.has(movie.id)" :saving="busyId === movie.id" @watchlist="emit('watchlist', movie)" />
  </div>
</template>
