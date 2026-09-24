<script setup lang="ts">
  import InputText from "primevue/inputtext";
  import Select from "primevue/select";

  defineProps<{
    categories: string[];
  }>();

  const query = defineModel<string>("query", { default: "" });
  const category = defineModel<string | null>("category", { default: null });

  function label(value: string): string {
    return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
</script>

<template>
  <div class="filters">
    <InputText v-model="query" class="search" placeholder="Search products..." aria-label="Search products" />
    <Select
      v-model="category"
      :options="categories"
      :option-label="label"
      placeholder="All categories"
      show-clear
      class="category"
      aria-label="Filter category"
    />
  </div>
</template>

<style scoped>
  .filters { display: flex; gap: .75rem; flex-wrap: wrap; }
  .search { flex: 1 1 18rem; }
  .category { min-width: 15rem; }
</style>
