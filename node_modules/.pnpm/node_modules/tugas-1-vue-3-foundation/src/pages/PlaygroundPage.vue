<script setup lang="ts">
  import { RouterLink } from "vue-router";

  import RefDemoCard from "@/components/Feature/Playground/RefDemoCard.vue";
  import ShallowRefDemoCard from "@/components/Feature/Playground/ShallowRefDemoCard.vue";
  import { Button } from "@/components/ui/button";
</script>

<template>
  <main class="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto grid max-w-5xl gap-8">
      <header class="grid gap-4">
        <Button as-child variant="ghost" class="w-fit px-0">
          <RouterLink to="/">Back to app</RouterLink>
        </Button>
        <div>
          <p class="text-sm font-medium text-primary">Vue reactivity playground</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            <code>ref()</code> vs <code>shallowRef()</code>
          </h1>
          <p class="mt-3 max-w-2xl text-muted-foreground">
            Try the same nested mutation in both cards. Then replace the shallow ref's root value to
            see what Vue tracks.
          </p>
        </div>
      </header>

      <div class="grid gap-6 md:grid-cols-2">
        <RefDemoCard />
        <ShallowRefDemoCard />
      </div>
    </div>
  </main>
</template>
