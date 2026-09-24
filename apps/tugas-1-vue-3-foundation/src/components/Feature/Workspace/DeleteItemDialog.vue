<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import type { WorkspaceItem } from "@/types/workspace";

  defineProps<{ item: WorkspaceItem | null }>();
  defineEmits<{ confirm: [] }>();
  const open = defineModel<boolean>({ required: true });
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete resource?</DialogTitle>
        <DialogDescription>
          “{{ item?.title }}” will be permanently removed from this browser.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button variant="destructive" @click="$emit('confirm')">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
