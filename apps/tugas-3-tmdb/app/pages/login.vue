<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { authClient } from '../lib/auth-client'

const route = useRoute()
const { user, configured, ready, refresh } = useAuth()
const pending = shallowRef(false)
const errorMessage = shallowRef('')

onMounted(() => {
  refresh().catch(() => { errorMessage.value = 'Sign in is unavailable. Please try again.' })
})

async function signIn() {
  pending.value = true
  errorMessage.value = ''
  try {
    const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
    if (result.error) errorMessage.value = 'Google sign in could not start. Please try again.'
  } catch {
    errorMessage.value = 'Google sign in could not start. Please try again.'
  } finally {
    pending.value = false
  }
}

useHead({ title: 'Sign In | Frame', meta: [{ name: 'description', content: 'Sign in to Frame with Google.' }] })
</script>

<template>
  <main id="main" class="mx-auto grid w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
    <section class="flex min-h-[26rem] flex-col justify-between bg-black p-8 text-white sm:p-12">
      <span class="text-sm font-semibold tracking-wide text-[#f5c518]">Frame</span>
      <div>
        <h1 class="max-w-xl text-5xl font-bold leading-none text-balance sm:text-7xl">Good films start here.</h1>
        <div class="mt-8 h-1 w-24 bg-[#f5c518]" aria-hidden="true" />
        <p class="mt-8 max-w-md text-lg text-white/75">Sign in to your Frame account with Google. Explore films powered by TMDB.</p>
      </div>
    </section>
    <section class="flex flex-col justify-center border border-black/15 p-8 sm:p-12" aria-labelledby="sign-in-heading">
      <h2 id="sign-in-heading" class="text-4xl font-bold">Sign in</h2>
      <p class="mt-3 max-w-sm text-black/65">Continue with your Google account.</p>
      <Message v-if="route.query.error || errorMessage" severity="error" class="mt-8" role="alert">{{ errorMessage || 'Google sign in was not completed. Please try again.' }}</Message>
      <Message v-else-if="ready && !configured" severity="warn" class="mt-8" role="status">Google sign in is not configured on this server. Add the Google and database settings, then try again.</Message>
      <div class="mt-8">
        <NuxtLink v-if="user" to="/" class="font-semibold underline decoration-[#f5c518] decoration-4 underline-offset-4">Browse films</NuxtLink>
        <Button v-else label="Continue with Google" :loading="pending" :disabled="!ready || !configured" class="w-full sm:w-auto" @click="signIn" />
      </div>
      <p class="mt-8 text-sm text-black/55">Your Google password stays with Google.</p>
    </section>
  </main>
</template>
