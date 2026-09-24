<script setup lang="ts">
  import Button from "primevue/button";
  import Card from "primevue/card";
  import Rating from "primevue/rating";
  import Tag from "primevue/tag";
  import { useRouter } from "vue-router";

  import { useCartStore } from "@/stores/useCartStore";
  import { formatCurrency } from "@/utils/formatCurrency";
  import type { Product } from "@/types/product";

  const props = defineProps<{ product: Product }>();
  const emit = defineEmits<{ added: [title: string]; unavailable: [title: string] }>();
  const router = useRouter();
  const cartStore = useCartStore();

  function addToCart(): void {
    if (cartStore.addToCart(props.product)) emit("added", props.product.title);
    else emit("unavailable", props.product.title);
  }

  function openDetail(): void {
    router.push({ name: "product-detail", params: { id: props.product.id } });
  }
</script>

<template>
  <Card class="product-card">
    <template #header>
      <button class="image-button" :aria-label="`Open ${product.title}`" @click="openDetail">
        <img :src="product.thumbnail" :alt="product.title" class="product-image" />
      </button>
    </template>
    <template #content>
      <div class="content">
        <Tag :value="product.category" severity="secondary" />
        <button class="product-title" @click="openDetail">{{ product.title }}</button>
        <p class="description">{{ product.description }}</p>
        <div class="rating"><Rating :model-value="Math.round(product.rating)" readonly :cancel="false" /><span>{{ product.rating.toFixed(1) }}</span></div>
        <div class="meta"><strong>{{ formatCurrency(product.price) }}</strong><span>{{ product.stock }} in stock</span></div>
      </div>
    </template>
    <template #footer>
      <Button label="Add to cart" icon="pi pi-shopping-cart" class="w-full" :disabled="product.stock < 1" @click="addToCart" />
    </template>
  </Card>
</template>

<style scoped>
  .product-card { height: 100%; overflow: hidden; }
  .image-button { border: 0; padding: 0; display: block; width: 100%; background: transparent; cursor: pointer; }
  .product-image { height: 12rem; width: 100%; object-fit: cover; background: var(--p-surface-100); }
  .content { display: grid; gap: .65rem; }
  .product-title { text-align: left; border: 0; background: transparent; padding: 0; font: inherit; font-weight: 650; cursor: pointer; line-height: 1.3; }
  .description { color: var(--p-text-muted-color); display: -webkit-box; overflow: hidden; margin: 0; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .rating, .meta { display: flex; align-items: center; justify-content: space-between; gap: .5rem; font-size: .875rem; }
  .rating :deep(.p-rating-icon) { font-size: .85rem; }
  .meta span { color: var(--p-text-muted-color); }
</style>
