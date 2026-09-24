<script setup lang="ts">
  import { ShoppingBag, ShoppingCart } from "@lucide/vue";
  import { storeToRefs } from "pinia";
  import Badge from "primevue/badge";
  import Button from "primevue/button";
  import Drawer from "primevue/drawer";
  import { shallowRef } from "vue";
  import { RouterLink, RouterView, useRouter } from "vue-router";

  import { useAuthStore } from "@/stores/useAuthStore";
  import { useCartStore } from "@/stores/useCartStore";

  const navigation = [
    { name: "Products", route: "products", icon: ShoppingBag },
    { name: "Cart", route: "cart", icon: ShoppingCart },
  ];
  const router = useRouter();
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  const { user } = storeToRefs(authStore);
  const mobileMenuOpen = shallowRef(false);

  async function logout(): Promise<void> {
    authStore.logout();
    await router.replace({ name: "login" });
  }
</script>

<template>
  <div class="shell">
    <header class="header">
      <div class="header-content">
        <Button class="menu" icon="pi pi-bars" text rounded aria-label="Open navigation" @click="mobileMenuOpen = true" />
        <Drawer v-model:visible="mobileMenuOpen" header="Mini Shop" position="left">
          <nav class="mobile-nav"><RouterLink v-for="item in navigation" :key="item.route" :to="{ name: item.route }" class="nav-link" active-class="active" @click="mobileMenuOpen = false"><component :is="item.icon" :size="18" />{{ item.name }}</RouterLink></nav>
        </Drawer>
        <RouterLink :to="{ name: 'products' }" class="brand">Mini Shop</RouterLink>
        <nav class="desktop-nav"><RouterLink v-for="item in navigation" :key="item.route" :to="{ name: item.route }" class="nav-link" active-class="active">{{ item.name }}</RouterLink></nav>
        <div class="account"><div class="user"><strong>{{ user?.name }}</strong><span>{{ user?.email }}</span></div><RouterLink :to="{ name: 'cart' }" class="cart-link" aria-label="Cart"><ShoppingCart :size="20" /><Badge v-if="cartStore.totalItems" :value="cartStore.totalItems" class="cart-badge" /></RouterLink><Button icon="pi pi-sign-out" text rounded aria-label="Log out" @click="logout" /></div>
      </div>
    </header>
    <main class="main"><RouterView /></main>
  </div>
</template>

<style scoped>
  .shell { min-height: 100vh; }.header { position: sticky; z-index: 10; top: 0; border-bottom: 1px solid var(--p-content-border-color); background: color-mix(in srgb, var(--p-surface-0) 94%, transparent); backdrop-filter: blur(10px); }.header-content, .main { width: min(100% - 2rem, 76rem); margin: auto; }.header-content { height: 4rem; display: flex; gap: 1rem; align-items: center; }.brand { color: var(--p-primary-700); font-weight: 750; text-decoration: none; }.desktop-nav, .mobile-nav { display: flex; gap: .25rem; }.mobile-nav { flex-direction: column; }.nav-link { display: flex; align-items: center; gap: .55rem; padding: .55rem .75rem; border-radius: .45rem; color: var(--p-text-muted-color); text-decoration: none; font-size: .9rem; }.nav-link:hover, .nav-link.active { background: var(--p-primary-50); color: var(--p-primary-700); }.account { margin-left: auto; display: flex; align-items: center; gap: .75rem; }.user { display: grid; text-align: right; font-size: .8rem; }.user span { color: var(--p-text-muted-color); }.cart-link { position: relative; color: inherit; }.cart-badge { position: absolute; top: -.65rem; right: -.75rem; }.main { padding-block: 2rem; }.menu { display: none; } @media (max-width: 42rem) { .menu { display: inline-flex; }.desktop-nav, .user { display: none; } }
</style>
