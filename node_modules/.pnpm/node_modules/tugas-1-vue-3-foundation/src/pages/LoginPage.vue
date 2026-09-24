<script setup lang="ts">
  import { storeToRefs } from "pinia";
  import { shallowRef } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import LoginForm from "@/components/Feature/Auth/LoginForm.vue";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { useAuthStore } from "@/stores/useAuthStore";
  import type { LoginPayload } from "@/types/auth";

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const { isLoading } = storeToRefs(authStore);
  const error = shallowRef("");

  async function login(payload: LoginPayload) {
    error.value = "";

    try {
      await authStore.login(payload);
      const redirect = route.query.redirect;
      await router.replace(
        typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/dashboard",
      );
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : "Unable to sign in.";
    }
  }
</script>

<template>
  <Card class="w-full max-w-md shadow-lg">
    <CardHeader>
      <CardTitle class="text-2xl">Welcome back</CardTitle>
      <CardDescription>Sign in with admin / admin123 to manage the workspace.</CardDescription>
    </CardHeader>
    <CardContent>
      <LoginForm :error="error" :loading="isLoading" @submit="login" />
    </CardContent>
  </Card>
</template>
