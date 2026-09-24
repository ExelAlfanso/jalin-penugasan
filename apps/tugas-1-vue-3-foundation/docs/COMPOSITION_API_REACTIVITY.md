# `ref`, `computed`, dan `watch` pada Vue 3

Dokumen ini menjelaskan tiga API reaktivitas yang sering digunakan dalam Vue 3 Composition API, sekaligus membandingkannya dengan fungsi React yang memiliki tujuan serupa.

Contoh menggunakan Vue 3 dengan `<script setup lang="ts">`.

## Peta konsep

| Vue | Peran | Padanan React yang paling dekat |
| --- | --- | --- |
| `ref` | Menyimpan state reaktif | `useState` |
| `computed` | Membuat nilai turunan dari state | `useMemo` atau nilai turunan biasa |
| `watch` | Menjalankan efek samping ketika state berubah | `useEffect` |

Cara mengingatnya:

```text
ref      -> data sumber
computed -> hasil perhitungan
watch    -> tindakan setelah perubahan
```

## 1. `ref`: state yang reaktif

`ref()` digunakan untuk membuat nilai yang dapat berubah dan tetap terhubung dengan sistem reaktivitas Vue. Ketika nilainya berubah, bagian template yang menggunakannya akan diperbarui.

```vue
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<template>
  <p>Count: {{ count }}</p>
  <button @click="increment">Tambah</button>
</template>
```

### Mengapa menggunakan `.value`?

Di dalam `<script>`, nilai yang dibuat oleh `ref` diakses melalui `.value`:

```ts
count.value++;
console.log(count.value);
```

Di dalam template Vue, `.value` dibuka secara otomatis:

```vue
<p>{{ count }}</p>
```

Tidak perlu menulis:

```vue
<p>{{ count.value }}</p>
```

### Padanan React: `useState`

Vue:

```ts
const count = ref(0);

count.value++;
```

React:

```tsx
const [count, setCount] = useState(0);

setCount((previousCount) => previousCount + 1);
```

Perbedaan utamanya:

- Vue mengubah nilai melalui `count.value`.
- React mengubah state melalui fungsi `setCount`.
- Vue melacak dependensi reaktif secara otomatis.
- React melakukan render ulang setelah setter state dipanggil.

### `ref` untuk object dan array

`ref` juga dapat menyimpan object atau array.

```ts
const user = ref({
  name: "Budi",
  age: 25,
});

user.value.name = "Sari";
```

Padanan React biasanya membuat object baru ketika mengubah state:

```tsx
const [user, setUser] = useState({
  name: "Budi",
  age: 25,
});

setUser((previousUser) => ({
  ...previousUser,
  name: "Sari",
}));
```

### Jangan menyamakan Vue `ref` dengan React `useRef`

Meskipun namanya mirip, kegunaannya berbeda.

Vue `ref` dapat memicu pembaruan tampilan:

```ts
const count = ref(0);
count.value++;
```

React `useRef` menyimpan nilai mutable, tetapi perubahan pada `.current` tidak memicu render ulang:

```tsx
const count = useRef(0);
count.current++;
```

Karena itu, padanan Vue `ref` yang paling dekat adalah React `useState`, bukan React `useRef`.

## 2. `computed`: nilai yang diturunkan dari state

`computed()` digunakan untuk membuat nilai yang berasal dari state lain. Nilai tersebut bukan state utama, melainkan hasil perhitungan dari state utama.

```vue
<script setup lang="ts">
import { computed, ref } from "vue";

const price = ref(100000);
const quantity = ref(2);

const total = computed(() => price.value * quantity.value);
</script>

<template>
  <p>Harga total: {{ total }}</p>
</template>
```

### Karakteristik `computed`

`computed`:

- otomatis mengetahui reactive value yang dipakai;
- hanya dihitung ulang ketika dependensinya berubah;
- menyimpan hasil sementara atau melakukan caching;
- sebaiknya tidak memiliki efek samping;
- cocok untuk filtering, sorting, formatting, dan kalkulasi.

### Padanan React: `useMemo`

Vue:

```ts
const total = computed(() => price.value * quantity.value);
```

React:

```tsx
const total = useMemo(
  () => price * quantity,
  [price, quantity],
);
```

Perbedaannya:

- Vue mendeteksi dependensi `computed` secara otomatis.
- React membutuhkan dependency array secara manual.
- `computed` menyatakan bahwa sebuah nilai adalah data turunan.
- `useMemo` di React terutama dipakai sebagai optimasi performa.

Untuk kalkulasi sederhana di React, `useMemo` sering tidak diperlukan:

```tsx
const total = price * quantity;
```

### Contoh filtering

Vue:

```ts
const search = ref("");
const users = ref([
  { name: "Budi" },
  { name: "Sari" },
  { name: "Andi" },
]);

const filteredUsers = computed(() => {
  const keyword = search.value.toLowerCase();

  return users.value.filter((user) =>
    user.name.toLowerCase().includes(keyword),
  );
});
```

React:

```tsx
const [search, setSearch] = useState("");
const [users] = useState([
  { name: "Budi" },
  { name: "Sari" },
  { name: "Andi" },
]);

const filteredUsers = useMemo(() => {
  const keyword = search.toLowerCase();

  return users.filter((user) =>
    user.name.toLowerCase().includes(keyword),
  );
}, [search, users]);
```

### Jangan gunakan `watch` untuk menggantikan `computed`

Kurang tepat:

```ts
const total = ref(0);

watch([price, quantity], () => {
  total.value = price.value * quantity.value;
});
```

Lebih tepat:

```ts
const total = computed(() => price.value * quantity.value);
```

`total` hanyalah hasil perhitungan, sehingga tidak membutuhkan efek samping. Gunakan state utama seminimal mungkin dan turunkan nilai lainnya dengan `computed`.

## 3. `watch`: mengawasi perubahan dan menjalankan efek samping

`watch()` digunakan ketika perubahan state harus menyebabkan tindakan tertentu di luar perhitungan biasa.

Contoh efek samping:

- menyimpan data ke `localStorage`;
- memanggil API;
- mengubah judul halaman;
- mengirim analytics;
- menjalankan timer;
- melakukan navigasi.

```vue
<script setup lang="ts">
import { ref, watch } from "vue";

const search = ref("");

watch(search, (newSearch, oldSearch) => {
  console.log(`Search berubah dari "${oldSearch}" menjadi "${newSearch}"`);
  localStorage.setItem("search", newSearch);
});
</script>

<template>
  <input v-model="search" placeholder="Cari pengguna" />
</template>
```

### Padanan React: `useEffect`

Vue:

```ts
watch(search, (newSearch) => {
  localStorage.setItem("search", newSearch);
});
```

React:

```tsx
useEffect(() => {
  localStorage.setItem("search", search);
}, [search]);
```

Perbedaannya:

| Vue `watch` | React `useEffect` |
| --- | --- |
| Sumber yang diawasi ditulis sebagai argumen pertama | Dependensi ditulis dalam array kedua |
| Tidak berjalan saat awal secara default | Umumnya berjalan setelah render awal |
| Callback menerima nilai baru dan nilai lama | Nilai lama harus dikelola sendiri |
| Dapat mengawasi satu atau beberapa sumber | Mengawasi nilai yang tercantum dalam dependency array |

### `watch` tidak langsung berjalan saat komponen dibuat

Secara default, watcher baru berjalan setelah nilai berubah:

```ts
watch(search, () => {
  console.log("Search berubah");
});
```

Gunakan `immediate: true` jika callback juga harus dijalankan saat watcher dibuat:

```ts
watch(
  search,
  (newSearch) => {
    console.log("Nilai search:", newSearch);
  },
  {
    immediate: true,
  },
);
```

Pada pemanggilan pertama dengan `immediate`, nilai lama dapat berupa `undefined` karena belum ada perubahan sebelumnya.

### Mengawasi beberapa sumber

Vue:

```ts
const firstName = ref("");
const lastName = ref("");

watch([firstName, lastName], ([newFirstName, newLastName]) => {
  console.log(newFirstName, newLastName);
});
```

React:

```tsx
useEffect(() => {
  console.log(firstName, lastName);
}, [firstName, lastName]);
```

### Mengawasi properti tertentu pada object

Gunakan getter jika hanya properti tertentu yang perlu diawasi:

```ts
const user = ref({
  name: "Budi",
  age: 25,
});

watch(
  () => user.value.name,
  (newName, oldName) => {
    console.log(`Nama berubah dari ${oldName} menjadi ${newName}`);
  },
);
```

Untuk perubahan nested object yang lebih dalam, opsi `deep: true` dapat digunakan. Gunakan dengan hati-hati karena watcher harus memeriksa lebih banyak perubahan:

```ts
watch(
  user,
  () => {
    console.log("Data user berubah");
  },
  { deep: true },
);
```

### Cleanup untuk request atau timer

Watcher dapat menerima `onCleanup` sebagai argumen ketiga. Gunakan untuk membatalkan proses lama sebelum proses baru dimulai.

```ts
watch(search, (newSearch, _, onCleanup) => {
  const controller = new AbortController();

  onCleanup(() => {
    controller.abort();
  });

  fetch(`/api/users?q=${encodeURIComponent(newSearch)}`, {
    signal: controller.signal,
  });
});
```

Konsepnya mirip cleanup function pada React `useEffect`:

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users?q=${encodeURIComponent(search)}`, {
    signal: controller.signal,
  });

  return () => {
    controller.abort();
  };
}, [search]);
```

## 4. `watchEffect`: watcher dengan dependensi otomatis

Vue juga menyediakan `watchEffect()` ketika semua reactive value yang digunakan di dalam callback ingin dilacak otomatis.

```ts
watchEffect(() => {
  console.log("Search saat ini:", search.value);
});
```

Perbandingannya:

```ts
watch(search, () => {
  // Sumber ditulis secara eksplisit.
});
```

```ts
watchEffect(() => {
  // Vue otomatis melacak search.value.
  console.log(search.value);
});
```

Padanan terdekat di React adalah `useEffect` dengan dependency array:

```tsx
useEffect(() => {
  console.log(search);
}, [search]);
```

Gunakan `watch` jika sumber dan nilainya harus jelas. Gunakan `watchEffect` jika dependensinya sederhana dan ingin dikumpulkan otomatis.

## 5. Contoh gabungan

### Vue

```vue
<script setup lang="ts">
import { computed, ref, watch } from "vue";

const price = ref(50000);
const quantity = ref(2);

const total = computed(() => price.value * quantity.value);

watch(quantity, (newQuantity, oldQuantity) => {
  console.log(`Jumlah berubah dari ${oldQuantity} menjadi ${newQuantity}`);
  localStorage.setItem("quantity", String(newQuantity));
});

function increaseQuantity() {
  quantity.value++;
}
</script>

<template>
  <section>
    <p>Harga satuan: {{ price }}</p>
    <p>Jumlah: {{ quantity }}</p>
    <p>Total: {{ total }}</p>

    <button @click="increaseQuantity">Tambah jumlah</button>
  </section>
</template>
```

### React

```tsx
function Product() {
  const [price] = useState(50000);
  const [quantity, setQuantity] = useState(2);

  const total = useMemo(
    () => price * quantity,
    [price, quantity],
  );

  useEffect(() => {
    localStorage.setItem("quantity", String(quantity));
  }, [quantity]);

  function increaseQuantity() {
    setQuantity((previousQuantity) => previousQuantity + 1);
  }

  return (
    <section>
      <p>Harga satuan: {price}</p>
      <p>Jumlah: {quantity}</p>
      <p>Total: {total}</p>

      <button onClick={increaseQuantity}>Tambah jumlah</button>
    </section>
  );
}
```

Pemetaan logikanya:

```text
Vue ref       -> React useState
Vue computed  -> React useMemo atau nilai turunan biasa
Vue watch     -> React useEffect
Vue .value    -> React state variable dan setter
```

## 6. Cara memilih API yang tepat

### Gunakan `ref` ketika:

- data dapat berubah;
- perubahan data harus memperbarui UI;
- data merupakan state utama komponen.

### Gunakan `computed` ketika:

- nilai dapat dihitung dari state lain;
- perhitungan harus tetap reaktif;
- tidak ada efek samping seperti API call atau penulisan storage.

### Gunakan `watch` ketika:

- perubahan data harus memicu API call;
- perubahan data harus disimpan ke `localStorage`;
- perlu menjalankan timer, analytics, atau navigasi;
- perlu mengetahui nilai baru dan nilai sebelumnya.

## 7. Kesalahan umum

### Menyimpan data turunan sebagai state tambahan

Kurang baik:

```ts
const firstName = ref("Budi");
const lastName = ref("Santoso");
const fullName = ref("");

watch([firstName, lastName], () => {
  fullName.value = `${firstName.value} ${lastName.value}`;
});
```

Lebih baik:

```ts
const fullName = computed(
  () => `${firstName.value} ${lastName.value}`,
);
```

### Menggunakan `watch` untuk semua logika

`watch` bukan pengganti `computed`. Jika hanya ingin menghasilkan nilai, gunakan `computed`. `watch` digunakan untuk efek samping.

### Lupa `.value` di dalam script

Salah:

```ts
count++;
```

Benar:

```ts
count.value++;
```

Pengecualian: di template, Vue otomatis melakukan unwrap sehingga cukup menulis `{{ count }}`.

### Menganggap `useMemo` selalu wajib di React

`useMemo` hanya diperlukan jika perhitungan cukup mahal atau stabilitas referensi memang penting. Untuk perhitungan kecil, nilai turunan biasa sering lebih sederhana:

```tsx
const total = price * quantity;
```

## Ringkasan

```text
ref      = simpan nilai yang berubah
computed = hitung nilai dari state lain
watch    = lakukan sesuatu setelah state berubah
```

Jika diterjemahkan ke React:

```text
ref      ≈ useState
computed ≈ useMemo atau derived value
watch    ≈ useEffect
```

Namun, padanan tersebut tidak sepenuhnya identik. Vue melacak dependensi reaktif secara otomatis, sedangkan React umumnya mengandalkan dependency array dan setter state secara eksplisit.
