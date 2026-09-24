<script setup lang="ts">
useHead({ htmlAttrs: { lang: 'en' }, meta: [{ name: 'theme-color', content: '#ffffff' }], link: [{ rel: 'preconnect', href: 'https://image.tmdb.org' }, { rel: 'preconnect', href: 'https://fonts.googleapis.com' }] })
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <NuxtRouteAnnouncer />
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-black/15">
      <div class="mx-auto max-w-7xl px-5 py-4 sm:px-8 flex items-center justify-between">
        <NuxtLink to="/" class="font-bold text-2xl tracking-tight hover:underline decoration-[#f5c518] decoration-4 underline-offset-4">FRAME</NuxtLink>
        <span class="text-sm text-black/65">A film catalogue</span>
      </div>
    </header>
    <NuxtPage />
    <footer class="mt-auto border-t border-black/15 px-5 py-8 sm:px-8">
      <div class="mx-auto max-w-7xl text-sm text-black/70">
        <h2 class="font-semibold text-black">Credits</h2>
        <p>Film data and images by <a href="https://www.themoviedb.org/" class="inline-block align-middle underline hover:text-black" target="_blank" rel="noopener noreferrer"><img src="/tmdb.svg" alt="TMDB" width="50" height="36" loading="lazy" /></a>.</p>
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
    </footer>
  </div>
</template>
