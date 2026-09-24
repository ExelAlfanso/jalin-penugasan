<script setup lang="ts">
  import { storeToRefs } from "pinia";
  import { shallowRef } from "vue";
  import { toast } from "vue-sonner";

  import DeleteItemDialog from "@/components/Feature/Workspace/DeleteItemDialog.vue";
  import WorkspaceItemDialog, {
    type WorkspaceDraft,
  } from "@/components/Feature/Workspace/WorkspaceItemDialog.vue";
  import WorkspaceTable from "@/components/Feature/Workspace/WorkspaceTable.vue";
  import WorkspaceToolbar from "@/components/Feature/Workspace/WorkspaceToolbar.vue";
  import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
  import type { WorkspaceItem } from "@/types/workspace";

  const workspaceStore = useWorkspaceStore();
  const { category, filteredItems, query, sortBy } = storeToRefs(workspaceStore);

  const editorOpen = shallowRef(false);
  const deleteOpen = shallowRef(false);
  const selectedItem = shallowRef<WorkspaceItem | null>(null);

  function createItem() {
    selectedItem.value = null;
    editorOpen.value = true;
  }

  function editItem(item: WorkspaceItem) {
    selectedItem.value = item;
    editorOpen.value = true;
  }

  function saveItem(draft: WorkspaceDraft) {
    if (selectedItem.value) {
      workspaceStore.updateItem(selectedItem.value.id, draft);
      toast.success("Resource updated");
    } else {
      workspaceStore.addItem(draft);
      toast.success("Resource created");
    }
    editorOpen.value = false;
  }

  function askToDelete(item: WorkspaceItem) {
    selectedItem.value = item;
    deleteOpen.value = true;
  }

  function deleteItem() {
    if (!selectedItem.value) return;
    workspaceStore.removeItem(selectedItem.value.id);
    deleteOpen.value = false;
    toast.success("Resource deleted");
  }

  async function copyLink(item: WorkspaceItem) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/workspace#${item.id}`);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }
</script>

<template>
  <section class="grid gap-6">
    <div>
      <h1 class="text-3xl font-semibold tracking-tight">Workspace</h1>
      <p class="mt-1 text-muted-foreground">Create, filter, and maintain local resources.</p>
    </div>

    <WorkspaceToolbar
      v-model:query="query"
      v-model:category="category"
      v-model:sort-by="sortBy"
      @create="createItem"
    />
    <WorkspaceTable
      :items="filteredItems"
      @edit="editItem"
      @delete="askToDelete"
      @copy-link="copyLink"
    />

    <WorkspaceItemDialog v-model="editorOpen" :item="selectedItem" @save="saveItem" />
    <DeleteItemDialog v-model="deleteOpen" :item="selectedItem" @confirm="deleteItem" />
  </section>
</template>
