<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <section>
    <h1>User {{ route.params.id }}</h1>
    <p>This dynamic page is served at <code>/users/:id</code>.</p>
    <NuxtLink to="/users">Back to users</NuxtLink>
  </section>
</template>
