<template>
  <div class="app">
    <header>
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/users">Users</NuxtLink>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style>
body { font-family: system-ui, sans-serif; margin: 0; }
.app { max-width: 720px; margin: auto; padding: 2rem; }
header { display: flex; gap: 1rem; }
a { color: #0066cc; }
</style>
