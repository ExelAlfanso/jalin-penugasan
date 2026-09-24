# Panduan agen — tugas-3-tmdb

Panduan ini berlaku untuk seluruh pekerjaan di direktori `apps/tugas-3-tmdb`.

## Konteks proyek

- Aplikasi katalog film berbasis TMDB. Saat ini proyek masih berupa starter Nuxt; jangan menganggap fitur katalog sudah tersedia.
- Stack saat ini: Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Pinia, dan PrimeVue. Periksa implementasi serta konfigurasi yang ada sebelum menambah dependensi atau mengubah arsitektur.
- `nuxt.config.ts` saat ini mengatur `ssr: false` dan menyediakan `runtimeConfig.tmdbApiKey`. Jangan menaruh kunci API atau rahasia lain di kode klien, log, maupun commit.

## Desain dan implementasi

- Gunakan palet utama `#FFFFFF` (putih), `#F5C518` (kuning), dan `#000000` (hitam). Nilai `#00000` pada permintaan awal ditafsirkan sebagai `#000000` karena kode hex lima digit tidak valid.
- Jaga kontras teks, status fokus keyboard, tata letak responsif, dan dukungan `prefers-reduced-motion` saat membuat antarmuka.
- Untuk pekerjaan Vue, gunakan Composition API, `<script setup lang="ts">`, state sesedikit mungkin, nilai turunan dengan `computed`, serta kontrak props dan emits yang bertipe. Pisahkan komponen atau composable saat tanggung jawabnya sudah berbeda.
- Gunakan skill `$frontend-design`, `$web-design-guidelines`, `$nuxt-skills:vue`, `$nuxt-skills:vue-best-practices`, dan `$nuxt-skills:vue-testing-best-practices` dalam alur pengembangan UI/Vue. Terapkan panduan desain sebelum implementasi, tinjau hasil UI dengan pedoman web, dan gunakan panduan pengujian saat menentukan atau menulis tes Vue.
- Saat memakai `$web-design-guidelines` untuk review, ambil pedoman terbaru dari URL yang ditentukan skill sebelum memeriksa berkas.

## Pemilihan model

Pilih model dan reasoning effort berikut bila lingkungan mendukung pemilihan model untuk pekerjaan tersebut. Klasifikasikan cakupan sebelum mulai; bila model tidak dapat diganti dalam sesi aktif, lanjutkan dengan model yang tersedia dan jangan menghambat pekerjaan.

| Jenis pekerjaan | Model | Reasoning effort |
| --- | --- | --- |
| Fix minor | `gpt-6-luna` | `xhigh` |
| Fitur minor | `gpt-5.6-terra` | `medium` |
| Fitur mayor | `gpt-6-sol` | default |
| Dokumentasi | `gpt-6-luna` | `xhigh` |
| Chore | `gpt-6-luna` | `xhigh` |

Perubahan minor bersifat lokal dan tidak mengubah alur utama atau kontrak lintas fitur. Perubahan mayor melibatkan beberapa bagian aplikasi atau perilaku produk yang substansial. Untuk kategori lain, gunakan model yang tersedia dengan penilaian yang sesuai.

## Verifikasi dan commit

- Jalankan pemeriksaan yang relevan dengan perubahan. Untuk perubahan aplikasi, gunakan skrip proyek yang tersedia seperti `npm run build` bila sesuai; tambahkan pengujian yang bermakna saat ada perilaku yang perlu dijaga.
- Setelah menyelesaikan setiap perubahan `fix`, `feat`, `docs`, atau `chore`, buat commit dengan pesan Conventional Commits yang sesuai, misalnya `docs: add project agent guidelines`.
- Stage hanya berkas yang terkait dengan pekerjaan sendiri. Jangan memasukkan perubahan pengguna atau berkas lain yang sudah berubah sebelumnya ke dalam commit.
