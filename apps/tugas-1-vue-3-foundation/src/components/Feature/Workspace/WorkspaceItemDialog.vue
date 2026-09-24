<script setup lang="ts">
  import { reactive, watch } from "vue";

  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import type { WorkspaceItem } from "@/types/workspace";

  export type WorkspaceDraft = Pick<WorkspaceItem, "title" | "content" | "category">;

  const props = defineProps<{
    item: WorkspaceItem | null;
  }>();
  const emit = defineEmits<{
    save: [draft: WorkspaceDraft];
  }>();
  const open = defineModel<boolean>({ required: true });

  const draft = reactive<WorkspaceDraft>({ title: "", content: "", category: "task" });

  watch(
    [open, () => props.item],
    ([isOpen, item]) => {
      if (!isOpen) return;
      draft.title = item?.title ?? "";
      draft.content = item?.content ?? "";
      draft.category = item?.category ?? "task";
    },
    { immediate: true },
  );

  function save() {
    emit("save", { ...draft, title: draft.title.trim(), content: draft.content.trim() });
  }
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <form class="grid gap-5" @submit.prevent="save">
        <DialogHeader>
          <DialogTitle>{{ item ? "Edit resource" : "New resource" }}</DialogTitle>
          <DialogDescription
            >Keep the title clear and add enough context for the team.</DialogDescription
          >
        </DialogHeader>

        <div class="grid gap-2">
          <Label for="item-title">Title</Label>
          <Input id="item-title" v-model="draft.title" required maxlength="100" />
        </div>

        <div class="grid gap-2">
          <Label for="item-content">Content</Label>
          <textarea
            id="item-content"
            v-model="draft.content"
            class="min-h-28 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            required
            maxlength="1000"
          />
        </div>

        <div class="grid gap-2">
          <Label>Category</Label>
          <Select v-model="draft.category">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="open = false">Cancel</Button>
          <Button type="submit">Save resource</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
