<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ middleware: 'authenticated' })

const { entries, savedIds, loading, error, refresh, toggle } = useWatchlist()
const count = computed(() => `${entries.value.length} ${entries.value.length === 1 ? 'film' : 'films'}`)

useHead({ title: 'My Watchlist | Frame', meta: [{ name: 'description', content: 'Your saved films on Frame.' }] })
</script>

<template>
  <main id="main" class="mx-auto w-full max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
    <header class="mb-10 border-b border-black/15 pb-8">
      <h1 class="text-5xl font-bold leading-none sm:text-7xl">My watchlist</h1>
      <p class="mt-4 text-black/65">Saved films, all in one place.</p>
    </header>
    <p v-if="error" class="mb-6 text-red-700" role="alert">{{ error }}</p>
    <div v-if="loading" role="status" aria-live="polite">
      <span class="sr-only">Loading watchlist…</span>
      <MovieGrid :movies="[]" loading />
    </div>
    <div v-else-if="error && !entries.length" class="border border-black/20 p-6">
      <Button label="Try Again" @click="refresh" />
    </div>
    <div v-else-if="!entries.length" class="border border-black/20 p-6">
      <p>Your watchlist is empty.</p>
      <NuxtLink to="/" class="mt-4 inline-block font-semibold underline decoration-accent decoration-4 underline-offset-4">Explore films</NuxtLink>
    </div>
    <template v-else>
      <p class="mb-5 text-sm text-black/65">{{ count }}</p>
      <MovieGrid :movies="entries" :saved-ids="savedIds" @watchlist="toggle" />
    </template>
  </main>
</template>
