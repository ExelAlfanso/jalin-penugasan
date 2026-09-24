import type { NavigationGuardReturn, RouteLocationNormalized } from "vue-router";

import { useAuthStore } from "@/stores/useAuthStore";

export function authGuard(to: RouteLocationNormalized): NavigationGuardReturn {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: "dashboard" };
  }

  return true;
}
