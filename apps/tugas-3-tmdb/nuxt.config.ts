// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@primevue/nuxt-module"],
  css: ["~/assets/main.css"],
  primevue: {
    importTheme: { from: "~/theme/movie.ts", as: "MovieTheme" },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    tmdbApiKey: "",
  },
  nitro: {
    alias: {
      // pg-native is optional; Workers use pg's pure JavaScript driver.
      "pg-native": fileURLToPath(new URL("./server/utils/pg-native-stub.ts", import.meta.url)),
    },
  },
});
