<script setup lang="ts">
  import { storeToRefs } from "pinia";
  import { computed } from "vue";

  import { Badge } from "@/components/ui/badge";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

  const workspaceStore = useWorkspaceStore();
  const { items } = storeToRefs(workspaceStore);

  const categories = computed(() => ({
    feature: items.value.filter((item) => item.category === "feature").length,
    bug: items.value.filter((item) => item.category === "bug").length,
    task: items.value.filter((item) => item.category === "task").length,
  }));
</script>

<template>
  <section class="grid gap-6">
    <div>
      <h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p class="mt-1 text-muted-foreground">Workspace activity at a glance.</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Total resources</CardDescription>
          <CardTitle class="text-3xl">{{ items.length }}</CardTitle>
        </CardHeader>
        <CardContent><Badge variant="secondary">All items</Badge></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Features</CardDescription>
          <CardTitle class="text-3xl">{{ categories.feature }}</CardTitle>
        </CardHeader>
        <CardContent><Badge variant="outline">Feature</Badge></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Bugs</CardDescription>
          <CardTitle class="text-3xl">{{ categories.bug }}</CardTitle>
        </CardHeader>
        <CardContent><Badge variant="destructive">Bug</Badge></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Tasks</CardDescription>
          <CardTitle class="text-3xl">{{ categories.task }}</CardTitle>
        </CardHeader>
        <CardContent><Badge variant="secondary">Task</Badge></CardContent>
      </Card>
    </div>
  </section>
</template>
