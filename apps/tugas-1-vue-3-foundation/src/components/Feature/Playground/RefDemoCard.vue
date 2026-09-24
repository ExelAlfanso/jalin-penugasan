<script setup lang="ts">
  import { ref } from "vue";

  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

  const settings = ref({ theme: "light" });

  function mutateNestedValue() {
    settings.value.theme = settings.value.theme === "light" ? "dark" : "light";
  }
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle><code>ref()</code></CardTitle>
      <CardDescription>Nested mutations are tracked deeply.</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-5">
      <div class="rounded-lg bg-muted p-4">
        <p class="text-sm text-muted-foreground">Visible theme</p>
        <p data-testid="ref-theme" class="mt-1 text-2xl font-semibold">{{ settings.theme }}</p>
      </div>
      <Button data-testid="ref-mutate" variant="outline" @click="mutateNestedValue">
        Mutate nested property
      </Button>
      <p class="text-sm text-muted-foreground">
        <code>settings.value.theme = …</code> triggers a render.
      </p>
    </CardContent>
  </Card>
</template>
