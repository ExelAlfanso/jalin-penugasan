import { onMounted, ref, shallowRef, watch } from "vue";

import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";

const PAGE_SIZE = 12;

export function useProductCatalog() {
  const products = ref<Product[]>([]);
  const categories = ref<string[]>([]);
  const query = shallowRef("");
  const category = shallowRef<string | null>(null);
  const page = shallowRef(0);
  const total = shallowRef(0);
  const loading = shallowRef(false);
  const error = shallowRef("");

  async function loadProducts(): Promise<void> {
    loading.value = true;
    error.value = "";
    const skip = page.value * PAGE_SIZE;

    try {
      const response = query.value.trim()
        ? await productService.searchProducts(query.value.trim(), PAGE_SIZE, skip)
        : category.value
          ? await productService.getProductsByCategory(category.value, PAGE_SIZE, skip)
          : await productService.getProducts(PAGE_SIZE, skip);
      products.value = response.products;
      total.value = response.total;
    } catch (caughtError) {
      products.value = [];
      error.value = caughtError instanceof Error ? caughtError.message : "Products unavailable.";
    } finally {
      loading.value = false;
    }
  }

  async function loadCategories(): Promise<void> {
    try {
      categories.value = await productService.getCategories();
    } catch {
      // Catalog still works when category endpoint fails.
    }
  }

  function changePage(nextPage: number): void {
    page.value = nextPage;
  }

  watch(category, () => {
    page.value = 0;
  });
  
  watch(
    query,
    (_value, _previous, onCleanup) => {
      page.value = 0;
      const timeout = window.setTimeout(loadProducts, 350);
      onCleanup(() => window.clearTimeout(timeout));
    },
  );

  watch([page, category], loadProducts, { immediate: true });
  onMounted(loadCategories);

  return {
    products,
    categories,
    query,
    category,
    page,
    total,
    loading,
    error,
    pageSize: PAGE_SIZE,
    loadProducts,
    changePage,
  };
}
