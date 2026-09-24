<script setup lang="ts">
  import { Copy, MoreHorizontal, Pencil, Trash2 } from "@lucide/vue";

  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import type { WorkspaceItem } from "@/types/workspace";
  import { formatDate } from "@/utils/formatDate";

  defineProps<{
    items: WorkspaceItem[];
  }>();

  defineEmits<{
    edit: [item: WorkspaceItem];
    delete: [item: WorkspaceItem];
    "copy-link": [item: WorkspaceItem];
  }>();
</script>

<template>
  <div class="overflow-hidden rounded-xl border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Resource</TableHead>
          <TableHead class="hidden md:table-cell">Category</TableHead>
          <TableHead class="hidden lg:table-cell">Updated</TableHead>
          <TableHead class="w-14"><span class="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="items.length === 0">
          <TableCell colspan="4" class="h-32 text-center text-muted-foreground">
            No resources match your filters.
          </TableCell>
        </TableRow>
        <TableRow v-for="item in items" v-else :id="item.id" :key="item.id">
          <TableCell>
            <p class="font-medium">{{ item.title }}</p>
            <p class="mt-1 line-clamp-2 max-w-2xl text-sm text-muted-foreground">
              {{ item.content }}
            </p>
            <Badge class="mt-2 md:hidden" variant="outline">{{ item.category }}</Badge>
          </TableCell>
          <TableCell class="hidden md:table-cell">
            <Badge :variant="item.category === 'bug' ? 'destructive' : 'secondary'">
              {{ item.category }}
            </Badge>
          </TableCell>
          <TableCell class="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
            {{ formatDate(item.updatedAt) }}
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button size="icon" variant="ghost" aria-label="Resource actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @select="$emit('edit', item)"> <Pencil /> Edit </DropdownMenuItem>
                <DropdownMenuItem @select="$emit('copy-link', item)">
                  <Copy /> Copy link
                </DropdownMenuItem>
                <DropdownMenuItem class="text-destructive" @select="$emit('delete', item)">
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
