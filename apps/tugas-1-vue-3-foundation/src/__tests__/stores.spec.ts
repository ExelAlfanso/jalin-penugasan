import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useAuthStore } from "@/stores/useAuthStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

describe("application stores", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("creates and clears an admin session", async () => {
    vi.useFakeTimers();
    const authStore = useAuthStore();
    const login = authStore.login({ email: "admin", password: "admin123" });

    await vi.runAllTimersAsync();
    await login;

    expect(authStore.isAuthenticated).toBe(true);
    expect(localStorage.getItem("app_auth_token")).toContain("mock-admin-token");

    authStore.logout();
    expect(authStore.isAuthenticated).toBe(false);
    expect(localStorage.getItem("app_auth_token")).toBeNull();
    vi.useRealTimers();
  });

  it("rejects invalid credentials", async () => {
    vi.useFakeTimers();
    const authStore = useAuthStore();
    let loginError: unknown;
    const login = authStore.login({ email: "admin", password: "wrong" }).catch((error) => {
      loginError = error;
    });

    await vi.runAllTimersAsync();
    await login;
    expect(loginError).toBeInstanceOf(Error);
    expect((loginError as Error).message).toContain("Invalid email or password");
    expect(authStore.isAuthenticated).toBe(false);
    vi.useRealTimers();
  });

  it("filters workspace items and persists changes", async () => {
    vi.useFakeTimers();
    const workspaceStore = useWorkspaceStore();

    workspaceStore.addItem({ title: "Write tests", content: "Cover stores", category: "task" });
    workspaceStore.query = "write";

    expect(workspaceStore.filteredItems).toHaveLength(1);
    expect(workspaceStore.filteredItems[0]?.title).toBe("Write tests");

    await vi.runAllTimersAsync();
    expect(localStorage.getItem("app_workspace_items")).toContain("Write tests");
    vi.useRealTimers();
  });
});
