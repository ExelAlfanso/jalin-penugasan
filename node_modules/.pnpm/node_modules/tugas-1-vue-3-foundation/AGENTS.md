# Struktur Proyek

src/
┣ assets/ # gambar, ikon, font
┣ components/ # komponen reusable (Base/, App/, Feature/*)
┣ composables/ # composables (useXxx.ts)
┣ directives/ # custom directives
┣ layouts/ # layout (DefaultLayout.vue, AuthLayout.vue)
┣ pages/ # halaman (Route level)
┣ router/ # router/index.ts, guards
┣ stores/ # Pinia stores (useXxxStore.ts)
┣ services/ # api client, repositori data
┣ types/ # tipe global (d.ts/ts)
┣ utils/ # helper kecil
┣ styles/ # global.css/scss, tokens, mixins
┣ App.vue
┗ main.ts

# Penamaan & Organisasi

### File & folder

- **Komponen Vue**: `PascalCase.vue` → `UserCard.vue`
- **Komponen dasar** (pure UI, tanpa bisnis): prefiks `Base` → `BaseButton.vue`, `BaseModal.vue`
- **Composable**: `useXxx.ts` → `useAuth.ts`
- **Store Pinia**: `useXxxStore.ts` → `useCartStore.ts`
- **Direktif**: `v-focus.ts` (file `focus.ts`, diekspor sebagai `v-focus`)
- **Util/helper**: `camelCase.ts` → `formatCurrency.ts`
- **Konstanta**: `SHOUTING_SNAKE_CASE`

### Komponen

- Satu file = satu komponen.
- Hindari file > 300 baris (pecah jadi sub-komponen).

### Props & Emits

- **Props**: camelCase (di template pakai kebab-case).
- **Emits**: kebab-case → `update:modelValue`, `submit`, `close`.

### Slot

- Slot default tanpa nama.
- Slot khusus bernama: `header`, `footer`, `icon`, dll.

---

# Template & Script

Prefer `<script setup>` dan Composition API.

```vue
<!-- components/UserCard.vue -->
<template>
  <article class="user-card" @click="onClick">
    <img :src="avatarUrl" :alt="`${name} avatar`" class="avatar" />
    <h3>{{ name }}</h3>
    <slot name="meta" />
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  avatarUrl: string
}>()

const emit = defineEmits<{
  (e: 'select'): void
}>()

function onClick() {
  emit('select')
}
</script>

<style scoped>
.user-card {
  display: grid;
  gap: 0.5rem;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
</style>
```

# Komentar & Dokumentasi

Jelas & singkat; jelaskan mengapa, bukan apa.

Gunakan JSDoc/TypeScript untuk tipe & konvensi API

# Linting, Format, Editor

- ESLint
- Prettier

```json
{
  "singleQuote": false,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "bracketSameLine": false,
  "vueIndentScriptAndStyle": true
}
```

- EditorConfig

```
root = true

[*]
indent_style = space
indent_size = 2
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```

# Pesan Komit (IGNORE THIS)

Conventional Commits

- feat: → `Untuk fitur baru, fungsi baru, kompenen baru`
- fix: → `Untuk perbaikan`
- refactor: → `Jika ada perubahan mekanisme atau penamaan komponen yang mengubah struktur`
- docs: → `Untuk dokumentasi`
- test: → `Untuk test`
- style:→ `Untuk perubahan css atau style class saja`
- setup:→ `Untuk setup build, package pada project`

Usahakan pesan berisi **keterangan singkat mengenai apa dan kenapa**.
File yang dicommit hanya yang sesuai atau terlibat sesuai dengan pesan komit.
Jika ada referensi tiket dapat dipisahkan dengan isi pesan.

```json
Contoh:
fix: Perbaikan fungsi A, karena kurang optimal pada logik saat perhitungan.


ref#76221 -> nomer tiket
---
style: Penambahan class text-red untuk memberikan tampilan error pada kalimat

---


```
