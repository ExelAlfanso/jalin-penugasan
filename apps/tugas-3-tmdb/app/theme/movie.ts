import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const preset = definePreset(Aura, {
  semantic: {
    primary: { 50: '#fffdf2', 100: '#fff8d6', 200: '#fceba1', 300: '#f9dc69', 400: '#f7ce3e', 500: '#f5c518', 600: '#d5a700', 700: '#9c7900', 800: '#6c5300', 900: '#423300', 950: '#241c00' },
    colorScheme: {
      light: {
        primary: { color: '#f5c518', contrastColor: '#000000', hoverColor: '#e3b600', activeColor: '#d5a700' },
        surface: { 0: '#ffffff', 50: '#fafafa', 100: '#f2f2f2', 200: '#dedede', 300: '#bdbdbd', 400: '#999999', 500: '#737373', 600: '#555555', 700: '#383838', 800: '#242424', 900: '#111111', 950: '#000000' },
      },
    },
  },
})

export default { preset, options: { darkModeSelector: false } }
