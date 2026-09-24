<script setup lang="ts">
  import { shallowRef } from "vue";

  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

  const settings = shallowRef({ theme: "light" });
  const renderCount = shallowRef(0);

  function mutateNestedValue() {
    settings.value.theme = settings.value.theme === "light" ? "dark" : "light";
  }

  function replaceRootValue() {
    settings.value = {
      ...settings.value,
      theme: settings.value.theme === "light" ? "dark" : "light",
    };
  }

  function forceRender() {
    renderCount.value += 1;
  }
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle><code>shallowRef()</code></CardTitle>
      <CardDescription>Only replacing the root value triggers reactivity.</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-5">
      <div class="rounded-lg bg-muted p-4">
        <p class="text-sm text-muted-foreground">Visible theme</p>
        <p data-testid="shallow-theme" class="mt-1 text-2xl font-semibold">{{ settings.theme }}</p>
      </div>
      <div class="grid gap-2 sm:grid-cols-2">
        <Button data-testid="shallow-mutate" variant="outline" @click="mutateNestedValue">
          Mutate nested property
        </Button>
        <Button data-testid="shallow-replace" @click="replaceRootValue">
          Replace root value
        </Button>
      </div>
      <Button variant="ghost" size="sm" @click="forceRender">
        Force render ({{ renderCount }})
      </Button>
      <p class="text-sm text-muted-foreground">
        Nested mutation changes the object but not the view. Force a render to inspect it; root
        replacement updates immediately.
      </p>
    </CardContent>
  </Card>
</template>
