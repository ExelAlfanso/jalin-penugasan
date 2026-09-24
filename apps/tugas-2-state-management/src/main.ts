import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import ToastService from "primevue/toastservice";
import "primeicons/primeicons.css";

import App from "./App.vue";
import router from "./router";
import "./styles/global.css";

const app = createApp(App);
const lightTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{indigo.50}",
      100: "{indigo.100}",
      200: "{indigo.200}",
      300: "{indigo.300}",
      400: "{indigo.400}",
      500: "{indigo.500}",
      600: "{indigo.600}",
      700: "{indigo.700}",
      800: "{indigo.800}",
      900: "{indigo.900}",
      950: "{indigo.950}",
    },
    colorScheme: {
      light: {
        surface: {
          0: "#ffffff",
          50: "#faf9ff",
          100: "#f3f1fb",
          200: "#e9e6f3",
          300: "#d8d4e5",
          400: "#aaa4bc",
          500: "#79738d",
          600: "#5d586f",
          700: "#454154",
          800: "#302d3d",
          900: "#211e2d",
          950: "#15131d",
        },
      },
    },
  },
});

app.use(createPinia());
app.use(router);
app.use(PrimeVue, { theme: { preset: lightTheme, options: { darkModeSelector: false } } });
app.use(ToastService);

app.mount("#app");
