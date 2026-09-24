<script setup lang="ts">
  import ProductCard from "@/components/Feature/Catalog/ProductCard.vue";
  import type { Product } from "@/types/product";

  defineProps<{ products: Product[] }>();
  const emit = defineEmits<{ added: [title: string]; unavailable: [title: string] }>();
</script>

<template>
  <div class="grid">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      @added="emit('added', $event)"
      @unavailable="emit('unavailable', $event)"
    />
  </div>
</template>

<style scoped>
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); }
</style>
