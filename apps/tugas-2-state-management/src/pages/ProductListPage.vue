<script setup lang="ts">
  import Button from "primevue/button";
  import Message from "primevue/message";
  import Paginator from "primevue/paginator";
  import ProgressSpinner from "primevue/progressspinner";
  import { useToast } from "primevue/usetoast";

  import ProductFilters from "@/components/Feature/Catalog/ProductFilters.vue";
  import ProductGrid from "@/components/Feature/Catalog/ProductGrid.vue";
  import { useProductCatalog } from "@/composables/useProductCatalog";

  const toast = useToast();
  const { products, categories, query, category, page, total, loading, error, pageSize, loadProducts, changePage } = useProductCatalog();

  function notifyAdded(title: string): void {
    toast.add({ severity: "success", summary: "Added to cart", detail: title, life: 2500 });
  }

  function notifyUnavailable(title: string): void {
    toast.add({ severity: "warn", summary: "Out of stock", detail: `${title} cannot be added.`, life: 2500 });
  }
</script>

<template>
  <section class="catalog">
    <div class="heading">
      <div><p class="eyebrow">Mini E-Commerce</p><h1>Find your next favorite</h1></div>
      <span>{{ total }} products</span>
    </div>
    <ProductFilters v-model:query="query" v-model:category="category" :categories="categories" />
    <div v-if="loading" class="state"><ProgressSpinner stroke-width="4" /><span>Loading products...</span></div>
    <Message v-else-if="error" severity="error" :closable="false">{{ error }} <Button label="Try again" text @click="loadProducts" /></Message>
    <template v-else>
      <ProductGrid v-if="products.length" :products="products" @added="notifyAdded" @unavailable="notifyUnavailable" />
      <Message v-else severity="info" :closable="false">No products match this search.</Message>
      <Paginator
        v-if="total > pageSize"
        :first="page * pageSize"
        :rows="pageSize"
        :total-records="total"
        class="paginator"
        @page="changePage($event.page)"
      />
    </template>
  </section>
</template>

<style scoped>
  .catalog { display: grid; gap: 1.5rem; }
  .heading { display: flex; justify-content: space-between; gap: 1rem; align-items: end; }
  .heading h1, .eyebrow { margin: 0; }
  .heading h1 { font-size: clamp(1.8rem, 5vw, 2.6rem); }.eyebrow { color: var(--p-primary-color); font-weight: 700; font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; }
  .heading > span { color: var(--p-text-muted-color); white-space: nowrap; }.state { min-height: 18rem; display: grid; place-content: center; justify-items: center; gap: 1rem; color: var(--p-text-muted-color); }.paginator { justify-self: center; }
</style>
