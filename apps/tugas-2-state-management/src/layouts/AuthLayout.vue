<template>
  <main class="auth-layout"><RouterView /></main>
</template>

<style scoped>
  .auth-layout { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; background: radial-gradient(circle at 15% 20%, #e9e7ff, transparent 35%), linear-gradient(135deg, #f7f6ff, var(--p-surface-0)); }
</style>
