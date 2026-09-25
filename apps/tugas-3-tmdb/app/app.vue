<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'

const { user, refresh, logout } = useAuth()
const loggingOut = shallowRef(false)
const logoutError = shallowRef('')

onMounted(() => { refresh().catch(() => {}) })

async function signOut() {
  loggingOut.value = true
  logoutError.value = ''
  try {
    await logout()
    await navigateTo('/')
  } catch {
    logoutError.value = 'Could not sign out. Please try again.'
  } finally {
    loggingOut.value = false
  }
}

useHead({ htmlAttrs: { lang: 'en' }, meta: [{ name: 'theme-color', content: '#ffffff' }], link: [{ rel: 'preconnect', href: 'https://image.tmdb.org' }, { rel: 'preconnect', href: 'https://fonts.googleapis.com' }] })
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <NuxtRouteAnnouncer />
  <Toast position="top-right" />
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-black/15">
      <div class="mx-auto max-w-7xl px-5 py-4 sm:px-8 flex flex-wrap items-center justify-between gap-4">
        <NuxtLink to="/" class="font-bold text-2xl tracking-tight hover:underline decoration-[#f5c518] decoration-4 underline-offset-4">FRAME</NuxtLink>
        <nav class="flex flex-wrap items-center gap-4 text-sm font-semibold" aria-label="Main navigation">
          <NuxtLink to="/" class="hover:underline decoration-[#f5c518] decoration-2 underline-offset-4">Films</NuxtLink>
          <template v-if="user">
            <NuxtLink to="/dashboard" class="hover:underline decoration-[#f5c518] decoration-2 underline-offset-4">Dashboard</NuxtLink>
            <span class="max-w-36 truncate text-black/65">{{ user.name }}</span>
            <Button label="Log out" text size="small" :loading="loggingOut" @click="signOut" />
          </template>
          <NuxtLink v-else to="/login" class="hover:underline decoration-[#f5c518] decoration-2 underline-offset-4">Sign in</NuxtLink>
        </nav>
      </div>
      <p v-if="logoutError" class="mx-auto max-w-7xl px-5 pb-3 text-sm text-red-700 sm:px-8" role="alert">{{ logoutError }}</p>
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
