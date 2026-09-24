<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { user } = useAuth()
useHead({ title: 'Dashboard | Frame' })
</script>

<template>
  <main id="main" class="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
    <div class="border-b border-black/15 pb-8">
      <h1 class="text-5xl font-bold leading-none sm:text-7xl">Your dashboard</h1>
      <p class="mt-4 break-words text-black/65">Welcome back{{ user?.username ? `, ${user.username}` : '' }}.</p>
    </div>
    <section class="mt-10 max-w-xl border-l-4 border-[#f5c518] bg-[#fafafa] p-6">
      <h2 class="text-3xl font-semibold">Your watchlist</h2>
      <p class="mt-2 text-black/65">Pick up where you left off with films saved to your TMDB account.</p>
      <NuxtLink to="/watchlist" class="mt-6 inline-block font-semibold underline decoration-[#f5c518] decoration-4 underline-offset-4">Open watchlist</NuxtLink>
    </section>
  </main>
</template>
