<script setup lang="ts">
import { computed } from 'vue'
import type { MovieSummary } from '../../types/movie'

const props = defineProps<{ movie: MovieSummary; priority?: boolean; saved?: boolean; saving?: boolean }>()
const emit = defineEmits<{ watchlist: [] }>()
const year = computed(() => props.movie.release_date?.slice(0, 4) || 'Year unknown')
const score = computed(() => Number.isFinite(props.movie.vote_average) ? props.movie.vote_average.toFixed(1) : '—')
</script>

<template>
  <article class="relative min-w-0">
    <NuxtLink :to="`/movie/${movie.id}`" class="group block min-w-0 rounded-sm focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#a47d00]" :aria-label="`${movie.title}, ${year}, rated ${score} out of 10`">
    <div class="aspect-[2/3] overflow-hidden bg-[#f2f2f2]">
      <img v-if="movie.poster_path" :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" :alt="`${movie.title} poster`" width="500" height="750" :loading="priority ? 'eager' : 'lazy'" :fetchpriority="priority ? 'high' : 'auto'" class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.025]" />
      <div v-else class="flex h-full items-center justify-center p-5 text-center text-sm text-black/60">Poster unavailable</div>
    </div>
    <h2 class="mt-3 text-xl sm:text-2xl font-semibold leading-tight break-words group-hover:underline decoration-[#f5c518] underline-offset-2">{{ movie.title }}</h2>
    <div class="mt-1 flex items-center justify-between gap-2 text-sm tabular">
      <span class="text-black/65">{{ year }}</span>
      <span class="font-semibold"><span aria-hidden="true" class="text-[#9c7900]">★</span> {{ score }}<span class="text-black/55">/10</span></span>
    </div>
    </NuxtLink>
    <Button
      class="!absolute !right-2 !top-2 !z-10 !size-10 !min-w-10 !rounded-none !border !border-black !p-0 !text-2xl !font-semibold !text-black hover:!bg-accent"
      :class="saved ? '!bg-accent' : '!bg-white'"
      :label="saved ? '−' : '+'"
      :aria-label="`${saved ? 'Remove' : 'Add'} ${movie.title} ${saved ? 'from' : 'to'} watchlist`"
      :aria-pressed="saved"
      :loading="saving"
      @click="emit('watchlist')"
    />
  </article>
</template>
