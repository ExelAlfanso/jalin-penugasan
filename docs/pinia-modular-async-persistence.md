# Pinia: Modular Store, Async Actions & State Persistence

> Catatan belajar untuk monorepo `jalin-penugasan` (Vue 3 + Vite + TypeScript).
> Semua klaim teknis di dokumen ini **diuji langsung terhadap `pinia@4.0.3`** yang terpasang di
> repo ini melalui `apps/tugas-2-state-management/src/__tests__/pinia-lesson.spec.ts`
> → hasil: **11 tests passed**.

---

## Daftar Isi

1. [Peta cepat: apa yang sudah ada di repo ini](#1-peta-cepat-apa-yang-sudah-ada-di-repo-ini)
2. [Modular store](#2-modular-store)
3. [Async actions](#3-async-actions)
4. [State persistence](#4-state-persistence)
5. [Temuan konkret di codebase ini](#5-temuan-konkret-di-codebase-ini)
6. [Testing & debugging](#6-testing--debugging)
7. [Latihan](#7-latihan)

---

## 1. Peta cepat: apa yang sudah ada di repo ini

| Berkas                                                               | Isi                                                                        | Catatan                            |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------- |
| `apps/tugas-2-state-management/src/stores/useCartStore.ts`           | setup store, state dihidrasi dari `localStorage`, persist via `watch` deep | Pola A (manual)                    |
| `apps/tugas-2-state-management/src/stores/useAuthStore.ts`           | setup store, async action `login()`, `shallowRef`, `isLoading`             | Disiplin try/finally sudah benar   |
| `apps/tugas-2-state-management/src/stores/counter.ts`                | setup store minimal                                                        | Sisa template, boleh dihapus       |
| `apps/tugas-2-state-management/src/composables/useProductCatalog.ts` | fetch + filter + pagination                                                | Composable, **bukan** store        |
| `apps/tugas-2-state-management/src/services/authStorage.ts`          | baca/tulis session manual                                                  | Menulis **dua** key token          |
| `apps/tugas-2-state-management/src/services/api.ts`                  | axios interceptor baca `localStorage` langsung                             | Sumber kebenaran kedua untuk token |
| `apps/tugas-1-vue-3-foundation/src/stores/useWorkspaceStore.ts`      | setup store + `useDebouncedWatch` 300 ms                                   | Debounce persist = bagus           |

Semua pola di atas valid. Dokumen ini mengisi bagian yang belum terlihat: batas antar-store, jebakan async, dan strategi persist yang lebih rapi.

---

## 2. Modular store

### 2.1 Mental model: satu store = satu domain

Modular bukan sekadar "satu file per store":

- satu store = satu **pemilik** data (cart, auth, katalog, preferensi UI);
- tidak ada state duplikat di dua store — kalau butuh, jadikan `computed` dari yang lain;
- `defineStore("cart", …)` → **id adalah kontrak publik**: dipakai devtools, key persist, dan pesan error;
- panggil `useXStore()` sedekat mungkin dengan pemakaian, jangan "load semua store" di `main.ts`.

Untuk repo yang makin besar, namespacing id itu murah dan menyelamatkan: `"shop/cart"`, `"auth/session"`. Devtools mengelompokkannya dan key persist tidak tabrakan.

### 2.2 Setup store: tiga aturan yang tidak bisa ditawar

Aturan ini berasal dari cara Pinia memisahkan state/getter/action saat store dibangun.

**Aturan 1 — state harus reaktif.** `ref()`, `reactive()`, atau `shallowRef()`. Nilai primitif biasa yang kamu `return` **tidak** dihitung sebagai state. Pinia 4 punya diagnostic khusus untuk ini:

```txt
PINIA_R1006: Property "x" of store "y" is not reactive (not a ref, reactive object, or shallowRef),
so storeToRefs() ignores it.
fix: wrap with ref(), reactive(), or shallowRef(). If it is intentionally non-reactive,
wrap it with markRaw() so storeToRefs() skips it explicitly.
```

**Aturan 2 — getter = `computed()`**, bukan function biasa. Hasilnya cached, readonly, dan bisa di-inspect (bahkan diedit, di devtools v4) sebagai getter.

**Aturan 3 — semua state yang dipakai harus di-`return`.** Tidak di-return → tidak masuk `$state` → tidak ikut SSR, devtools, dan plugin persist. Ini penyebab nomor satu bug "kok persist-nya tidak jalan".

Yang sudah benar di repo ini: `totalItems`, `totalPrice`, `isAdmin`, `isAuthenticated` adalah `computed`, bukan data tersimpan. **Derived data jangan pernah jadi state** — itu sumber desync.

### 2.3 Store vs composable

| Kebutuhan                                             | Pilih                                |
| ----------------------------------------------------- | ------------------------------------ |
| Dibagi lintas halaman/komponen, hidup selama aplikasi | **Store** — cart, auth session, tema |
| Hidup selama komponen/halaman itu saja, ikut unmount  | **Composable** — `useProductCatalog` |

`useProductCatalog` saat ini sepenuhnya per-instance: pindah halaman → unmount → refetch dari nol dan filter hilang. Itu **benar** untuk state filter. Tapi kalau nanti mau "kembali ke katalog tanpa refetch" (cache), yang diangkat ke store hanya bagian yang mau dibagi: `products`, `total`, `categories`, `lastFetchedAt`. `query`, `page`, `loading`, `error` tetap di composable.

Aturan praktis: composable yang isinya `ref()` biasa → calon store. Composable yang isinya `onMounted`, listener, dan siklus hidup per komponen → tetap composable.

### 2.4 Komposisi antar store (dan jebakan module scope)

Store boleh memanggil store lain. Yang **salah**: memanggil di top-level file.

```ts
// ❌ SALAH — dieksekusi saat import, sebelum app.use(pinia) selesai
const authStore = useAuthStore();
export const useCartStore = defineStore("cart", () => {
  /* ... */
});
```

```ts
// ✅ BENAR — dipanggil di dalam action/getter, saat pinia sudah aktif
export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  function checkout(): string {
    const authStore = useAuthStore(); // <-- di sini
    if (!authStore.isAuthenticated) throw new Error("Login dulu.");

    const orderId = `ORD-${Date.now()}`;
    items.value = [];
    return orderId;
  }

  return { items, checkout };
});
```

Alasan teknisnya: Pinia 4 punya diagnostic `PINIA_R1004` — _"Pinia instance not found in context. This falls back to the global activePinia, which exposes you to cross-request pollution on the server."_ Di SPA biasanya masih jalan; di SSR/SSG atau multi-instance (test paralel) itu bug senyap.

Bonus: action yang memanggil action lain tetap tercatat di `$onAction` sebagai sub-action, jadi logging/analytics tidak bolong.

### 2.5 `storeToRefs` dan jebakan destructure

```ts
const cart = useCartStore();

const { items, totalItems } = cart; // ❌ reaktivitas hilang
const { items, totalItems } = storeToRefs(cart); // ✅
```

Terverifikasi di test: `storeToRefs(cart)` menghasilkan key `items`, `totalItems`, `totalPrice` dan **tidak** berisi `addToCart`. Jadi:

- pakai `storeToRefs` hanya untuk state + getter;
- action tetap dipanggil dari `cart.addToCart(...)` (action sudah terikat ke store, tidak perlu ref).

Catatan Pinia 4: nilai `null`/`undefined` di-skip dengan rapi oleh `storeToRefs` (dulu bikin error), dan properti non-reaktif memicu `PINIA_R1006` — pesannya sudah menyertakan cara memperbaiki.

### 2.6 `$reset()` tidak ada di setup store

Terverifikasi: `cart.$reset` **adalah function**, tetapi memanggilnya **throw** di mode dev:

```txt
🍍: Store "cart" is built using the setup syntax and does not implement $reset().
```

Di build produksi `$reset` menjadi noop diam-diam — jadi bug-nya bisa muncul hanya di dev, atau justru hanya "hilang" di prod. Solusi: pola factory.

```ts
function createInitialState() {
  return { items: [] as CartItem[], lastError: "" };
}

export const useCartStore = defineStore("cart", () => {
  const initial = createInitialState();
  const items = ref<CartItem[]>(initial.items);
  const lastError = shallowRef(initial.lastError);

  function reset(): void {
    const fresh = createInitialState();
    items.value = fresh.items;
    lastError.value = fresh.lastError;
  }

  return { items, lastError, reset };
});
```

Yang tetap bekerja normal di setup store (terverifikasi): `$patch({…})`, `$patch(fn)`, `$state`, `$subscribe`, `$onAction`, `$dispose`. Hanya `$reset` yang hilang.

---

## 3. Async actions

### 3.1 Bentuk dan kontraknya

Di setup store, "action" = fungsi biasa (boleh `async`) yang kamu `return`. Tidak ada objek `actions`.

- satu tanggung jawab per action (`login`, `logout`, `fetchProducts`, `checkout`);
- selalu set flag loading/error, selalu bersihkan di `finally`;
- **return sesuatu yang berguna**: `addToCart(): boolean` adalah pola bagus — UI bisa memberi feedback tanpa menebak isi state.

`useAuthStore.ts:16` sudah disiplin: `isLoading` diset sebelum `try`, di-reset di `finally`. Terverifikasi:

```ts
const promise = auth.login({ email: "admin", password: "admin123" });
expect(auth.isLoading).toBe(true); // loading muncul sinkron
await promise;
expect(auth.isLoading).toBe(false);
expect(auth.isAuthenticated).toBe(true);
```

Jalur gagal juga benar: `rejects.toThrow()` dan `isLoading` kembali `false` karena `finally`.

### 3.2 `$onAction` = middleware untuk action (terverifikasi)

Hook dipanggil **sebelum** action berjalan, dan kamu bisa memasang `after` / `onError` per pemanggilan — termasuk untuk action async.

```ts
const off = auth.$onAction(({ name, args, after, onError }) => {
  const start = performance.now();
  console.log("[action]", name, args);

  after((result) => {
    analytics.track(name, { ms: performance.now() - start, ok: true });
  });

  onError((error) => {
    toast.add({ severity: "error", summary: `${name} gagal`, detail: String(error) });
  });
});

// nanti: off() untuk berhenti
```

Urutan yang dibuktikan test untuk kasus sukses-lalu-gagal:

```txt
["start:login", "after:login", "start:login", "error:login"]
```

Kegunaan nyata: toast error global, loading bar, audit log — dan menghapus `try/catch` berulang di setiap pemanggil. Pasang sekali di `main.ts`, semua action tercakup.

> **Scope.** Kalau `$onAction`/`$subscribe` dipanggil **di dalam komponen**, ia otomatis dibersihkan saat komponen unmount. Di luar komponen (plugin, `main.ts`, service) ia hidup terus: pakai `detached: true` bila memang ingin melepas dari scope, dan simpan fungsi `off()` yang dikembalikan untuk cleanup.

### 3.3 Race condition — masalah async yang paling halus

`useProductCatalog.ts` sudah punya debounce 350 ms, tapi belum ada guard bila respons datang tidak berurutan. Skenario: user mengetik `"a"` lalu `"ab"`; request `"a"` selesai belakangan → tabel menampilkan hasil `"a"` padahal query sudah `"ab"`.

```ts
let requestSeq = 0; // di dalam setup(), jadi per-instance store

async function loadProducts(): Promise<void> {
  const seq = ++requestSeq;
  loading.value = true;
  error.value = "";

  try {
    const response = await fetchSomething();
    if (seq !== requestSeq) return; // respons basi → buang
    products.value = response.products;
  } catch (caught) {
    if (seq !== requestSeq) return; // error basi → jangan ditampilkan
    error.value = toMessage(caught);
  } finally {
    if (seq === requestSeq) loading.value = false; // jangan matikan loading request terbaru
  }
}
```

Alternatif: `AbortController` untuk membatalkan request lama. **Pilih satu**, jangan dua-duanya di action yang sama.

### 3.4 Yang dilarang dan kenapa

- **`$patch(async …)` tidak boleh.** Type-nya sendiri menolak: `stateMutator: ReturnType<F> extends Promise<any> ? never : F`. Callback `$patch` harus sinkron.
- **`computed` async tidak ada.** Data async = state + action.
- **Getter yang memicu request** ("getter ajaib") → tidak bisa di-cache, tidak terlihat sebagai action di devtools, sulit dites.
- **Menelan error** (`catch {}` kosong) → UI diam, user bingung. Minimal simpan `error` ref; idealnya pakai `$onAction` `onError`.
- **Satu flag loading global** untuk semua request → pakai per-resource (`isLoadingProducts`, `isSavingOrder`). `isLoading` di auth sudah tepat karena hanya login/logout yang memakainya.

### 3.5 Optimistic update + rollback

```ts
async function updateQuantity(productId: number, quantity: number): Promise<void> {
  const item = items.value.find((i) => i.product.id === productId);
  if (!item) return;

  const previous = item.quantity;
  item.quantity = quantity; // optimis: UI langsung berubah

  try {
    await api.patch(`/cart/${productId}`, { quantity });
  } catch (caught) {
    item.quantity = previous; // rollback
    lastError.value = toMessage(caught);
    throw caught; // biarkan pemanggil / onError menangani
  }
}
```

---

## 4. State persistence

### 4.1 Tentukan dulu: apa yang boleh dipersist

| Persist                                                                               | Jangan persist                                                                   |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Cart items, preferensi UI (tema, sidebar), token/session, draft form, filter terakhir | `isLoading` / `isError` (state sementara, bisa "nyangkut" `true`)                |
|                                                                                       | Data fetch yang harus fresh (katalog) — kecuali sengaja cache + TTL              |
|                                                                                       | Instance non-serializable (router, Chart, WebSocket) → `skipHydrate` / `markRaw` |
|                                                                                       | PII atau rahasia melebihi kebutuhan                                              |

### 4.2 Pola A — baca saat init + `watch` (dipakai di cart & workspace store)

```ts
const items = ref<CartItem[]>(readItems()); // hydrate
watch(items, (value) => localStorage.setItem(KEY, JSON.stringify(value)), { deep: true });
```

Plus / minus yang terverifikasi dan terlihat di kode:

- **Plus:** sederhana, tanpa plugin, kontrol penuh. `useDebouncedWatch(…, 300, { deep: true })` di `tugas-1` sudah bagus: tidak menulis tiap keystroke.
- **Minus (penting):** penulisan ke storage bersifat **async** (watch default flush `"pre"`). Di test, `localStorage` masih `null` tepat setelah `addToCart()`, dan baru terisi setelah `await nextTick()`. Kalau ada kode yang membaca storage secara sinkron segera setelah mutasi, nilainya masih basi.
- **Minus:** debounce = risiko kehilangan update terakhir saat tab ditutup. Tambal dengan:

```ts
window.addEventListener("beforeunload", () => saveNow());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveNow();
});
```

- `watch` harus `deep: true` untuk array/objek; mutasi nested tanpa `deep` tidak terdeteksi.
- Penulisan `localStorage` sinkron dan memblokir main thread — jangan persist objek besar tiap perubahan.

### 4.3 Pola B — plugin global dengan `$subscribe`

Perilaku yang dibaca dari `dist/pinia.js` dan diuji:

- `$subscribe` pada dasarnya `watch(() => pinia.state.value[$id], cb, { deep: true, …options })`;
- default `flush: "pre"` → **async**, butuh tick. Terverifikasi: setelah `addToCart()`, spy default belum terpanggil; setelah `await nextTick()`, baru terpanggil;
- `{ flush: "sync" }` → langsung sinkron. Terverifikasi;
- `store.$patch(…)` selalu memicu subscriber secara sinkron (karena itu dokumentasi menyebut opsi `flush` tidak memengaruhi `$patch`);
- callback yang sama didaftarkan dua kali akan di-dedupe dan Pinia mengeluarkan diagnostic `PINIA_R1007`. Simpan fungsi `off()`-nya.

Implementasi plugin, cocok dengan struktur repo ini:

```ts
// src/stores/plugins/persist.ts
import type { PiniaPluginContext } from "pinia";

interface PersistOptions {
  key?: string;
  pick?: string[];
}

// wajib: daftarkan opsi custom ke tipe Pinia
declare module "pinia" {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions;
  }
}

export function persistPlugin({ store, options }: PiniaPluginContext): void {
  const persist = (options as { persist?: PersistOptions }).persist;
  if (!persist) return;

  const key = persist.key ?? `pinia:${store.$id}`;
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      store.$patch(JSON.parse(raw));
    } catch {
      localStorage.removeItem(key); // data korup / format lama → jangan bikin app crash
    }
  }

  store.$subscribe(
    (_mutation, state) => {
      const data = persist.pick
        ? Object.fromEntries(persist.pick.map((k) => [k, (state as Record<string, unknown>)[k]]))
        : state;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { detached: true },
  );
}
```

```ts
// main.ts
const pinia = createPinia();
pinia.use(persistPlugin); // HARUS sebelum app.use(pinia)
app.use(pinia);
```

```ts
// pemakaian di store
defineStore(
  "cart",
  () => {
    /* ... */
  },
  { persist: { pick: ["items"] } },
);
```

Terbukti jalan di test: hanya `theme` yang dipersist (sidebar sengaja diabaikan), lalu dengan pinia baru (simulasi reload) `theme` kembali `"dark"` sementara `sidebar` kembali ke default `true`.

### 4.4 Pola C — plugin komunitas

```txt
pinia-plugin-persistedstate@4.7.1
peerDependencies: pinia >= 3.0.0  → kompatibel dengan pinia 4.0.3 di repo ini
(status: belum terpasang; pnpm-lock.yaml bersih dari nama itu)
```

Kelebihan: opsi `persist` per store, custom storage (localStorage/sessionStorage/cookie), serializer, `beforeRestore`/`afterRestore`, dukungan Nuxt. Satu perintah:

```bash
pnpm add pinia-plugin-persistedstate -F tugas-2-state-management
```

lalu `pinia.use(piniaPluginPersistedstate)`, menggantikan persist manual di cart & auth secara konsisten. **Nama opsi persisnya cek README versi tersebut** — jangan mengandalkan hafalan.

Rekomendasi untuk repo ini: **Pola B** (plugin sendiri, ±30 baris) — cukup, tanpa dependency tambahan, dan kamu memahami mekanismenya. Pindah ke Pola C saat butuh cookie / sessionStorage / Nuxt.

### 4.5 Tiga hal yang hampir selalu bikin persist "aneh"

**(a) Serializer.** `JSON.stringify(new Date())` → string, dan saat dihidrasi tetap string, bukan `Date`. Sama untuk `Map`, `Set`, `undefined`, `NaN`, `Infinity`, dan class instance.

```ts
// saat persist
const data = { ...state, createdAt: state.createdAt.toISOString() };
// saat hydrate
store.$patch({ ...parsed, createdAt: new Date(parsed.createdAt) });
```

Kalau butuh tipe kaya: `superjson` atau `devalue` (devalue juga dipakai ekosistem Vue untuk SSR karena aman-XSS).

**(b) Versioning + migration.** Bentuk schema akan berubah. Bungkus sejak awal:

```ts
interface Persisted<T> {
  v: number;
  data: T;
}

const VERSION = 2;

// hydrate
const box = JSON.parse(raw) as Persisted<unknown>;
const data = box.v === VERSION ? box.data : migrate(box.v, box.data);
store.$patch(data as never);

function migrate(from: number, data: unknown) {
  if (from === 1) {
    // v1: { items: [{ id, qty }] } → v2: { items: [{ product, quantity }] }
  }
  return data;
}
```

Tanpa versi, user yang membuka app setelah deploy akan menghidrasi state bentuk lama ke store baru → crash acak yang sulit direproduksi.

**(c) `skipHydrate`.** Pinia melewatkan objek yang bukan plain object saat hidrasi, tapi ref yang "terlihat seperti state padahal bukan" harus ditandai manual:

```ts
import { skipHydrate } from "pinia";

const draft = skipHydrate(ref("")); // terverifikasi import & berjalan di pinia 4.0.3
// contoh nyata: ref yang menyimpan instance chart, router, atau WebSocket
```

### 4.6 Persistence & keamanan

- `localStorage` dapat dibaca JavaScript apa pun → rentan XSS. Token idealnya di cookie `httpOnly` + `Secure` + `SameSite`. Kalau tetap di localStorage: jangan jadikan role/permission di klien sebagai dasar otorisasi (server tetap verifikasi ulang), dan jangan simpan PII.
- `authStorage.ts:65` — `setSession` menulis **dua** key: `"token"` dan `"app_auth_token"` (legacy). Dua key = dua kebenaran yang bisa berbeda. `api.ts:8` membaca `"token"` langsung dari `localStorage`, sedangkan komponen membaca lewat store. Kalau keduanya pernah tidak sinkron (mis. logout membersihkan satu key saja), request bisa terkirim dengan token yang seharusnya sudah mati. Pilih **satu sumber kebenaran**.
- **SSR:** di server `localStorage` tidak ada. Semua akses harus lewat guard `typeof window !== "undefined"` (atau `import.meta.client` di Nuxt). Pola A/B di atas browser-only; begitu pindah ke SSR, plugin harus jadi no-op di server.

### 4.7 Multi-tab sync (murah, jarang dipakai)

```ts
window.addEventListener("storage", (event) => {
  if (event.key === "pinia:cart" && event.newValue) {
    cart.$patch(JSON.parse(event.newValue));
  }
});
```

User membuka 2 tab, menambah item di tab A → tab B ikut update. Event `storage` hanya dikirim ke tab **lain** (bukan tab penulis), jadi tidak ada loop.

---

## 5. Temuan konkret di codebase ini

1. **`useCartStore.ts:24`** — `watch` persist tanpa `immediate`: benar (data awal sudah dibaca `readItems()`), tapi ingat sifatnya async → butuh tick. Kalau ada alur "simpan lalu langsung cek", pakai `flush: "sync"` atau panggil fungsi save eksplisit.
2. **`useCartStore.ts:26`** — `addToCart` mengembalikan `boolean` untuk feedback UI: pertahankan pola ini.
3. **`useCartStore.ts`** — `$reset` tidak valid (setup store → throw). Tambahkan `reset()` manual dengan pola factory (§2.6) bila ada tombol "kosongkan".
4. **`useAuthStore.ts:9-11`** — `shallowRef` untuk token/user: bagus (objek diganti utuh). Konsekuensi: `auth.user.value.name = "x"` **tidak** memicu update. Ganti objeknya, jangan mutasi.
5. **`useAuthStore.ts:16`** — error dari `authStorage.validateCredentials` dilempar ke pemanggil tetapi tidak disimpan di state, sehingga UI tidak punya `error` yang reaktif. Tambahkan `const loginError = shallowRef("")`, atau tangani lewat `$onAction` `onError` global (§3.2).
6. **`api.ts:8` + `authStorage.ts:65`** — dua jalur baca/tulis token. Satukan ke satu modul (`authStorage`), atau ambil lewat store di dalam interceptor; jangan campur.
7. **`useProductCatalog.ts:24-30`** — debounce ada, guard urutan respons belum (§3.3). Pertanyaan desain: bila filter harus bertahan saat user kembali dari halaman detail, angkat `products`/`categories`/`total` ke store; `query`/`page` tetap lokal.
8. **`counter.ts`** — sisa template. Hapus bila tidak dipakai agar devtools bersih.
9. **Belum ada `acceptHMRUpdate`** — setiap kali store diedit, state dev ter-reset. Tambahkan:

```ts
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
```

10. **Pinia 4 bersifat ESM-only** (peer Vue naik, `devtools-api` v8). Tidak masalah untuk Vite di repo ini, tapi perlu diingat bila ada tooling lama berbasis CJS.

---

## 6. Testing & debugging

- `setActivePinia(createPinia())` di `beforeEach`; `disposePinia(pinia)` di `afterEach` bila membuat banyak instance (tersedia di pinia 4.0.3, berguna juga untuk store non-app).
- `@pinia/testing@2.0.1` — `peerDependencies: pinia >= 4.0.2` → cocok. `createTestingPinia()` meng-stub action menjadi `vi.fn()` secara default, jadi komponen bisa dites tanpa memanggil API nyata. Perhatikan: action yang di-stub **tidak** mengubah state — ini sering membingungkan.
- **Vue devtools:** store bisa di-inspect dan diedit (di v4 getter writable/computed juga editable). Semua `$state` store muncul di sana — cara tercepat men-debug "kok persist kosong": cek dulu apakah data ada di `$state`; kalau tidak, berarti state-nya tidak di-`return` dari setup.
- Contoh test yang memverifikasi semua klaim dokumen ini:

```bash
cd apps/tugas-2-state-management
npx vitest run src/__tests__/pinia-lesson.spec.ts
# → Test Files 1 passed (1) | Tests 11 passed (11)
```

---

## 7. Latihan

Urut dari mudah ke sulit.

1. **Plugin persist untuk auth.** Ganti persist manual `useAuthStore` dengan plugin Pola B: `persist: { pick: ["token", "user"] }`, pastikan `isLoading` tidak ikut dipersist (pakai `skipHydrate` atau cukup tidak dimasukkan ke `pick`).
2. **`checkout()` di cart.** Panggil `useAuthStore()` **di dalam action**, `throw` bila belum login, kosongkan cart bila sukses. Tulis test jalur sukses + jalur gagal.
3. **Guard race condition.** Tambahkan `requestSeq` (atau `AbortController`) di `useProductCatalog`, lalu tulis test: panggil `loadProducts()` dua kali dengan mock respons terbalik; pastikan hasil query terakhir yang menang.
4. **Versioning + migrate.** Ubah bentuk `CartItem` dari `{ id, qty }` ke `{ product, quantity }` di cart, sertakan migrasi v1 → v2, dan test hidrasi data v1.
5. **`$onAction` global.** Di `main.ts`: toast error otomatis + log durasi semua action. Setelah itu hapus `try/catch` duplikat di komponen.

---

### Referensi

- Dokumentasi resmi Pinia — <https://pinia.vuejs.org>
- Changelog Pinia v4 — <https://github.com/vuejs/pinia/blob/v4/packages/pinia/CHANGELOG.md>
- `pinia-plugin-persistedstate` — <https://prazdevs.github.io/pinia-plugin-persistedstate/>
- Berkas verifikasi: `apps/tugas-2-state-management/src/__tests__/pinia-lesson.spec.ts`
