<script setup lang="ts">
  import Button from "primevue/button";
  import Card from "primevue/card";
  import Message from "primevue/message";
  import ProgressSpinner from "primevue/progressspinner";
  import Rating from "primevue/rating";
  import Tag from "primevue/tag";
  import { useToast } from "primevue/usetoast";
  import { onMounted, ref, shallowRef } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import { productService } from "@/services/product.service";
  import { useCartStore } from "@/stores/useCartStore";
  import { formatCurrency } from "@/utils/formatCurrency";
  import type { Product } from "@/types/product";

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const cartStore = useCartStore();
  const product = ref<Product | null>(null);
  const loading = shallowRef(true);
  const error = shallowRef("");

  async function loadProduct(): Promise<void> {
    loading.value = true;
    error.value = "";
    try {
      product.value = await productService.getProductById(String(route.params.id));
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : "Product unavailable.";
    } finally { loading.value = false; }
  }

  function addToCart(): void {
    if (!product.value) return;
    const success = cartStore.addToCart(product.value);
    toast.add({ severity: success ? "success" : "warn", summary: success ? "Added to cart" : "Out of stock", detail: product.value.title, life: 2500 });
  }

  onMounted(loadProduct);
</script>

<template>
  <div v-if="loading" class="state"><ProgressSpinner /><span>Loading product...</span></div>
  <Message v-else-if="error" severity="error" :closable="false">{{ error }} <Button label="Back to products" text @click="router.push({ name: 'products' })" /></Message>
  <Card v-else-if="product" class="detail">
    <template #content>
      <div class="detail-content">
        <img :src="product.images[0] || product.thumbnail" :alt="product.title" class="image" />
        <div class="copy">
          <Tag :value="product.category" severity="secondary" /><h1>{{ product.title }}</h1><p class="description">{{ product.description }}</p>
          <div class="facts"><span>Brand <strong>{{ product.brand || "Unknown" }}</strong></span><span>Discount <strong>{{ product.discountPercentage.toFixed(0) }}%</strong></span><span>Stock <strong>{{ product.stock }}</strong></span></div>
          <div class="rating"><Rating :model-value="Math.round(product.rating)" readonly :cancel="false" /><span>{{ product.rating.toFixed(1) }}</span></div>
          <p class="price">{{ formatCurrency(product.price) }}</p>
          <Button label="Add to cart" icon="pi pi-shopping-cart" :disabled="product.stock < 1" @click="addToCart" />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
  .state { min-height: 18rem; display: grid; place-content: center; justify-items: center; gap: 1rem; }.detail-content { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2rem; }.image { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: .75rem; }.copy { display: grid; align-content: center; justify-items: start; gap: 1rem; }.copy h1, .description, .price { margin: 0; }.description { color: var(--p-text-muted-color); line-height: 1.7; }.facts { display: grid; gap: .5rem; width: 100%; }.facts span { display: flex; justify-content: space-between; border-bottom: 1px solid var(--p-content-border-color); padding-bottom: .45rem; }.rating { display: flex; align-items: center; gap: .5rem; }.price { font-size: 2rem; font-weight: 700; } @media (max-width: 44rem) { .detail-content { grid-template-columns: 1fr; } }
</style>
