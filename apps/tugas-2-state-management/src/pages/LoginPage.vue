<script setup lang="ts">
  import Button from "primevue/button";
  import Card from "primevue/card";
  import InputText from "primevue/inputtext";
  import Message from "primevue/message";
  import Password from "primevue/password";
  import { reactive, shallowRef } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import { useAuthStore } from "@/stores/useAuthStore";

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const credentials = reactive({ email: "", password: "" });
  const error = shallowRef("");

  async function login(): Promise<void> {
    error.value = "";
    try {
      await authStore.login(credentials);
      const redirect = route.query.redirect;
      await router.replace(typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/products");
    } catch (caughtError) { error.value = caughtError instanceof Error ? caughtError.message : "Unable to sign in."; }
  }
</script>

<template>
  <Card class="login-card">
    <template #title>Welcome to Mini Shop</template>
    <template #subtitle>Use admin / admin123 to browse products.</template>
    <template #content>
      <form class="form" @submit.prevent="login">
        <InputText v-model="credentials.email" placeholder="Username" autocomplete="username" required />
        <Password v-model="credentials.password" placeholder="Password" :feedback="false" toggle-mask autocomplete="current-password" required />
        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        <Button label="Sign in" type="submit" :loading="authStore.isLoading" />
      </form>
    </template>
  </Card>
</template>

<style scoped>
  .login-card { width: min(100%, 26rem); }.form { display: grid; gap: 1rem; }.form :deep(.p-password), .form :deep(.p-password-input) { width: 100%; }
</style>
