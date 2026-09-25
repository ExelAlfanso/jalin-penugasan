// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@primevue/nuxt-module"],
  css: ["~/assets/main.css"],
  tailwindcss: {
    cssPath: "~/assets/main.css",
    config: {
      theme: {
        extend: {
          colors: {
            primary: "var(--color-primary)",
            secondary: "var(--color-secondary)",
            accent: "var(--color-accent)",
          },
        },
      },
    },
  },
  primevue: {
    importTheme: { from: '~/theme/movie.ts', as: 'MovieTheme' },
  },
  runtimeConfig: {
    tmdbApiKey: "",
  },
});
