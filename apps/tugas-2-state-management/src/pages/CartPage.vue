<script setup lang="ts">
  import Button from "primevue/button";
  import Card from "primevue/card";
  import Message from "primevue/message";
  import { useToast } from "primevue/usetoast";

  import CartLine from "@/components/Feature/Cart/CartLine.vue";
  import { useCartStore } from "@/stores/useCartStore";
  import { formatCurrency } from "@/utils/formatCurrency";

  const cartStore = useCartStore();
  const toast = useToast();

  function checkout(): void {
    if (!cartStore.totalItems) return;
    cartStore.clearCart();
    toast.add({ severity: "success", summary: "Checkout complete", detail: "Your order has been placed.", life: 3000 });
  }
</script>

<template>
  <section class="cart">
    <div><p class="eyebrow">Shopping cart</p><h1>Your items</h1></div>
    <Message v-if="!cartStore.items.length" severity="info" :closable="false">Your cart is empty. <RouterLink :to="{ name: 'products' }">Browse products</RouterLink></Message>
    <div v-else class="cart-content">
      <Card><template #content><CartLine v-for="item in cartStore.items" :key="item.product.id" :item="item" @increase="cartStore.increaseQuantity" @decrease="cartStore.decreaseQuantity" @remove="cartStore.removeFromCart" /></template></Card>
      <Card class="summary"><template #title>Order summary</template><template #content><div class="summary-row"><span>Total items</span><strong>{{ cartStore.totalItems }}</strong></div><div class="summary-row total"><span>Total price</span><strong>{{ formatCurrency(cartStore.totalPrice) }}</strong></div><Button label="Checkout" icon="pi pi-credit-card" class="w-full" @click="checkout" /></template></Card>
    </div>
  </section>
</template>

<style scoped>
  .cart { display: grid; gap: 1.5rem; }.cart h1, .eyebrow { margin: 0; }.eyebrow { color: var(--p-primary-color); font-weight: 700; font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; }.cart-content { display: grid; grid-template-columns: minmax(0, 1fr) 20rem; gap: 1.5rem; align-items: start; }.summary { position: sticky; top: 6rem; }.summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; }.total { border-top: 1px solid var(--p-content-border-color); padding-top: 1rem; font-size: 1.15rem; } @media (max-width: 48rem) { .cart-content { grid-template-columns: 1fr; }.summary { position: static; } }
</style>
