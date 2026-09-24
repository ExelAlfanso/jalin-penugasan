import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";

import type { CartItem, Product } from "@/types/product";

const CART_KEY = "mini_ecommerce_cart";

function readItems(): CartItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(value) ? (value as CartItem[]) : [];
  } catch {
    return [];
  }
}

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>(readItems());
  const totalItems = computed(() => items.value.reduce((total, item) => total + item.quantity, 0));
  const totalPrice = computed(() =>
    items.value.reduce((total, item) => total + item.product.price * item.quantity, 0),
  );

  watch(items, (value) => localStorage.setItem(CART_KEY, JSON.stringify(value)), { deep: true });

  function addToCart(product: Product): boolean {
    const item = items.value.find((entry) => entry.product.id === product.id);

    if (item) {
      if (item.quantity >= product.stock) return false;
      item.quantity += 1;
      return true;
    }

    if (product.stock < 1) return false;
    items.value.push({ product, quantity: 1 });
    return true;
  }

  function removeFromCart(productId: number): void {
    items.value = items.value.filter((item) => item.product.id !== productId);
  }

  function increaseQuantity(productId: number): void {
    const item = items.value.find((entry) => entry.product.id === productId);
    if (item && item.quantity < item.product.stock) item.quantity += 1;
  }

  function decreaseQuantity(productId: number): void {
    const item = items.value.find((entry) => entry.product.id === productId);
    if (!item) return;
    if (item.quantity === 1) removeFromCart(productId);
    else item.quantity -= 1;
  }

  function clearCart(): void {
    items.value = [];
  }

  return {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  };
});
