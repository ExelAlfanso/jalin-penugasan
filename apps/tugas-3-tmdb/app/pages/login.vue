<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const { user } = useAuth()
const redirect = computed(() => route.query.redirect === '/watchlist' ? '/watchlist' : '/dashboard')
const startUrl = computed(() => `/api/auth/start?redirect=${encodeURIComponent(redirect.value)}`)
const errorMessage = computed(() => {
  if (route.query.error === 'denied') return 'TMDB sign in was not completed. Please try again.'
  if (route.query.error === 'unavailable') return 'TMDB is unavailable or not configured. Please try again later.'
  return ''
})

useHead({ title: 'Sign In | Frame', meta: [{ name: 'description', content: 'Connect your TMDB account to access your Frame dashboard and watchlist.' }] })
</script>

<template>
  <main id="main" class="mx-auto grid w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
    <section class="flex min-h-[26rem] flex-col justify-between bg-black p-8 text-white sm:p-12">
      <span class="text-sm font-semibold tracking-wide text-[#f5c518]">Frame</span>
      <div>
        <h1 class="max-w-xl text-5xl font-bold leading-none text-balance sm:text-7xl">Keep your next film close.</h1>
        <div class="mt-8 h-1 w-24 bg-[#f5c518]" aria-hidden="true" />
        <p class="mt-8 max-w-md text-lg text-white/75">Sign in with TMDB to open your dashboard and watchlist.</p>
      </div>
    </section>
    <section class="flex flex-col justify-center border border-black/15 p-8 sm:p-12" aria-labelledby="sign-in-heading">
      <h2 id="sign-in-heading" class="text-4xl font-bold">Sign in</h2>
      <p class="mt-3 max-w-sm text-black/65">You will continue on TMDB to approve access to your account.</p>
      <Message v-if="errorMessage" severity="error" class="mt-8" role="alert">{{ errorMessage }}</Message>
      <Message v-if="route.query.warning === 'revocation'" severity="warn" class="mt-8" role="alert">You are signed out here, but TMDB could not confirm the session was revoked. Review your TMDB account security settings.</Message>
      <div class="mt-8">
        <NuxtLink v-if="user" to="/dashboard" class="font-semibold underline decoration-[#f5c518] decoration-4 underline-offset-4">Go to dashboard</NuxtLink>
        <Button v-else as="a" :href="startUrl" label="Continue with TMDB" class="w-full sm:w-auto" />
      </div>
      <p class="mt-8 text-sm text-black/55">Your TMDB password is entered only on TMDB.</p>
    </section>
  </main>
</template>
