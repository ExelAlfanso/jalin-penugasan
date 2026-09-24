import { computed, shallowRef } from "vue";
import { defineStore } from "pinia";
import { authStorage } from "@/services/authStorage";
import type { LoginPayload, UserProfile } from "@/types/auth";

export const useAuthStore = defineStore("auth", () => {
  const initialSession = authStorage.getSession();

  const token = shallowRef<string | null>(initialSession.token);
  const user = shallowRef<UserProfile | null>(initialSession.user);
  const isLoading = shallowRef(false);

  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const isAdmin = computed(() => user.value?.role === "admin");

  async function login(payload: LoginPayload): Promise<void> {
    isLoading.value = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const validatedUser = authStorage.validateCredentials(payload);
      const nextToken = `mock-admin-token-${Date.now()}`;

      token.value = nextToken;
      user.value = validatedUser;
      authStorage.setSession(nextToken, validatedUser);
    } finally {
      isLoading.value = false;
    }
  }

  function logout(): void {
    token.value = null;
    user.value = null;
    authStorage.clearSession();
  }

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };
});
