import { computed, ref, shallowRef } from "vue";
import { defineStore } from "pinia";
import { useDebouncedWatch } from "@/composables/useDebouncedWatch";
import { workspaceStorage } from "@/services/workspaceStorage";
import type { WorkspaceFilters, WorkspaceItem } from "@/types/workspace";

type WorkspaceItemInput = Omit<WorkspaceItem, "id" | "updatedAt">;
type WorkspaceItemUpdate = Partial<WorkspaceItemInput>;

function createItemId(): string {
  return crypto.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function now(): string {
  return new Date().toISOString();
}

export const useWorkspaceStore = defineStore("workspace", () => {
  const items = ref<WorkspaceItem[]>(workspaceStorage.getItems());
  const query = shallowRef("");
  const category = shallowRef<WorkspaceFilters["category"]>("all");
  const sortBy = shallowRef<WorkspaceFilters["sortBy"]>("updatedAt");

  const filteredItems = computed(() => {
    const normalizedQuery = query.value.trim().toLowerCase();

    return [...items.value]
      .filter((item) => {
        const matchesQuery = item.title.toLowerCase().includes(normalizedQuery);
        const matchesCategory = category.value === "all" || item.category === category.value;

        return matchesQuery && matchesCategory;
      })
      .sort((a, b) =>
        sortBy.value === "title"
          ? a.title.localeCompare(b.title)
          : b.updatedAt.localeCompare(a.updatedAt),
      );
  });

  useDebouncedWatch(
    items,
    (nextItems) => {
      workspaceStorage.saveItems(nextItems);
    },
    300,
    { deep: true },
  );

  function addItem(input: WorkspaceItemInput): WorkspaceItem {
    const item = {
      ...input,
      id: createItemId(),
      updatedAt: now(),
    };

    items.value.push(item);
    return item;
  }

  function updateItem(id: string, updates: WorkspaceItemUpdate): void {
    const item = items.value.find((currentItem) => currentItem.id === id);

    if (!item) {
      return;
    }

    Object.assign(item, updates, { updatedAt: now() });
  }

  function removeItem(id: string): void {
    items.value = items.value.filter((item) => item.id !== id);
  }

  return {
    items,
    query,
    category,
    sortBy,
    filteredItems,
    addItem,
    updateItem,
    removeItem,
  };
});
