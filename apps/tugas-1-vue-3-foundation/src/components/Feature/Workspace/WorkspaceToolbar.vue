<script setup lang="ts">
  import { Plus, Search } from "@lucide/vue";

  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import type { WorkspaceFilters } from "@/types/workspace";

  const query = defineModel<string>("query", { required: true });
  const category = defineModel<WorkspaceFilters["category"]>("category", { required: true });
  const sortBy = defineModel<WorkspaceFilters["sortBy"]>("sortBy", { required: true });

  defineEmits<{
    create: [];
  }>();
</script>

<template>
  <div class="flex flex-col gap-3 lg:flex-row">
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        v-model="query"
        class="pl-9"
        placeholder="Search resources…"
        aria-label="Search resources"
      />
    </div>

    <Select v-model="category">
      <SelectTrigger class="w-full lg:w-40" aria-label="Filter by category">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        <SelectItem value="feature">Feature</SelectItem>
        <SelectItem value="bug">Bug</SelectItem>
        <SelectItem value="task">Task</SelectItem>
      </SelectContent>
    </Select>

    <Select v-model="sortBy">
      <SelectTrigger class="w-full lg:w-44" aria-label="Sort resources">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="updatedAt">Recently updated</SelectItem>
        <SelectItem value="title">Title</SelectItem>
      </SelectContent>
    </Select>

    <Button @click="$emit('create')">
      <Plus />
      New resource
    </Button>
  </div>
</template>
