<script setup lang="ts">
  import Button from "primevue/button";
  import InputNumber from "primevue/inputnumber";

  import { formatCurrency } from "@/utils/formatCurrency";
  import type { CartItem } from "@/types/product";

  defineProps<{ item: CartItem }>();
  const emit = defineEmits<{
    increase: [productId: number];
    decrease: [productId: number];
    remove: [productId: number];
  }>();
</script>

<template>
  <article class="line">
    <img :src="item.product.thumbnail" :alt="item.product.title" class="image" />
    <div class="details">
      <h2 class="title">{{ item.product.title }}</h2>
      <p class="price">{{ formatCurrency(item.product.price) }} each</p>
      <p class="subtotal">Subtotal: {{ formatCurrency(item.product.price * item.quantity) }}</p>
    </div>
    <div class="actions">
      <div class="quantity">
        <Button icon="pi pi-minus" severity="secondary" text rounded aria-label="Decrease quantity" @click="emit('decrease', item.product.id)" />
        <InputNumber :model-value="item.quantity" :min="1" :max="item.product.stock" readonly input-class="quantity-input" />
        <Button icon="pi pi-plus" severity="secondary" text rounded aria-label="Increase quantity" :disabled="item.quantity >= item.product.stock" @click="emit('increase', item.product.id)" />
      </div>
      <Button label="Remove" icon="pi pi-trash" severity="danger" text @click="emit('remove', item.product.id)" />
    </div>
  </article>
</template>

<style scoped>
  .line { display: grid; grid-template-columns: 5rem 1fr auto; gap: 1rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--p-content-border-color); }
  .image { width: 5rem; height: 5rem; border-radius: .5rem; object-fit: cover; }
  .details { min-width: 0; }
  .title, .price, .subtotal { margin: 0; }
  .title { font-size: 1rem; }
  .price { color: var(--p-text-muted-color); margin-top: .25rem; }
  .subtotal { font-weight: 600; margin-top: .5rem; }
  .actions { display: grid; justify-items: end; gap: .25rem; }
  .quantity { display: flex; align-items: center; }
  .quantity :deep(.p-inputnumber-input) { width: 3rem; text-align: center; padding: .4rem; }
  @media (max-width: 36rem) { .line { grid-template-columns: 4rem 1fr; }.image { width: 4rem; height: 4rem; }.actions { grid-column: 1 / -1; justify-items: stretch; }.quantity { justify-content: center; } }
</style>
