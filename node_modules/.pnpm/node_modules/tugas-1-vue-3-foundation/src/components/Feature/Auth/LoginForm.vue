<script setup lang="ts">
  import { reactive } from "vue";

  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import type { LoginPayload } from "@/types/auth";

  defineProps<{
    error?: string;
    loading: boolean;
  }>();

  const emit = defineEmits<{
    submit: [payload: LoginPayload];
  }>();

  const credentials = reactive<LoginPayload>({
    email: "",
    password: "",
  });

  function submit() {
    emit("submit", { ...credentials });
  }
</script>

<template>
  <form class="grid gap-5" @submit.prevent="submit">
    <div class="grid gap-2">
      <Label for="email">Email or username</Label>
      <Input
        id="email"
        v-model="credentials.email"
        name="email"
        autocomplete="username"
        placeholder="admin@example.com"
        required
      />
    </div>

    <div class="grid gap-2">
      <Label for="password">Password</Label>
      <Input
        id="password"
        v-model="credentials.password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
      />
    </div>

    <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>

    <Button type="submit" :disabled="loading">
      {{ loading ? "Signing in…" : "Sign in" }}
    </Button>
  </form>
</template>
