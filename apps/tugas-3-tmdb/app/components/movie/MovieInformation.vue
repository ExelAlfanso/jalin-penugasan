<script setup lang="ts">
import { computed } from 'vue'
import type { MovieDetail } from '../../types/movie'
const props = defineProps<{ movie: MovieDetail; saved?: boolean; saving?: boolean }>()
const emit = defineEmits<{ trailer: []; watchlist: [] }>()
const year = computed(() => props.movie.release_date?.slice(0, 4) || 'Year unknown')
const runtime = computed(() => props.movie.runtime ? `${Math.floor(props.movie.runtime / 60)}h ${props.movie.runtime % 60}m` : 'Runtime unknown')
</script>

<template>
  <article>
    <div class="relative min-h-52 overflow-hidden bg-[#f2f2f2] sm:min-h-80">
      <img v-if="movie.backdrop_path" :src="`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`" alt="" width="1280" height="720" class="absolute inset-0 h-full w-full object-cover" fetchpriority="high" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
    </div>
    <div class="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
      <div class="relative -mt-16 grid gap-8 sm:-mt-28 sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <div class="w-36 sm:w-full aspect-[2/3] bg-[#f2f2f2] shadow-lg">
          <img v-if="movie.poster_path" :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" :alt="`${movie.title} poster`" width="500" height="750" class="h-full w-full object-cover" />
          <div v-else class="flex h-full items-center justify-center p-5 text-center">Poster unavailable</div>
        </div>
        <div class="pt-0 sm:pt-32 min-w-0">
          <h1 class="text-5xl sm:text-6xl font-bold leading-none text-balance break-words">{{ movie.title }}</h1>
          <p class="mt-4 text-black/70 tabular">{{ year }} <span aria-hidden="true">·</span> {{ runtime }} <span v-if="movie.genres.length" aria-hidden="true">·</span> {{ movie.genres.map(genre => genre.name).join(', ') }}</p>
          <p class="mt-5 font-semibold tabular"><span aria-hidden="true" class="text-[#9c7900]">★</span> {{ movie.vote_average.toFixed(1) }} <span class="font-normal text-black/60">/ 10 TMDB</span></p>
          <div class="mt-6 flex flex-wrap gap-3">
            <Button label="Watch Trailer" @click="emit('trailer')" />
            <Button :label="saved ? 'Remove from watchlist' : 'Add to watchlist'" :outlined="!saved" :severity="saved ? 'secondary' : undefined" :loading="saving" @click="emit('watchlist')" />
          </div>
          <section class="mt-12 max-w-2xl">
            <h2 class="text-3xl font-semibold">Overview</h2>
            <p class="mt-3 leading-relaxed text-black/80">{{ movie.overview || 'No synopsis is available for this film.' }}</p>
          </section>
          <section class="mt-12">
            <h2 class="text-3xl font-semibold">Cast</h2>
            <ul v-if="movie.credits.cast.length" class="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
              <li v-for="person in movie.credits.cast" :key="person.id" class="min-w-0">
                <p class="font-semibold break-words">{{ person.name }}</p>
                <p class="text-sm text-black/65 break-words">{{ person.character || 'Role unavailable' }}</p>
              </li>
            </ul>
            <p v-else class="mt-3 text-black/70">Cast information is unavailable.</p>
          </section>
        </div>
      </div>
    </div>
  </article>
</template>
