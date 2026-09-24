/**
 * Scratch verification for the Pinia lesson (modular store / async actions / persistence).
 * Run: npx vitest run src/__tests__/pinia-lesson.spec.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, nextTick, ref } from "vue";
import { createPinia, defineStore, setActivePinia, skipHydrate, storeToRefs } from "pinia";

import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Product } from "@/types/product";

function makeProduct(id: number, stock = 3): Product {
  return {
    id,
    title: `Product ${id}`,
    description: "d",
    category: "c",
    price: 100,
    discountPercentage: 0,
    rating: 4,
    stock,
    thumbnail: "t",
    images: [],
  };
}

describe("1. modular store: setup store + storeToRefs", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("storeToRefs returns state/getters refs but not actions", () => {
    const cart = useCartStore();
    cart.addToCart(makeProduct(1, 5));

    const refs = storeToRefs(cart);
    const keys = Object.keys(refs);

    expect(keys).toContain("items");
    expect(keys).toContain("totalItems");
    expect(keys).toContain("totalPrice");
    expect(keys).not.toContain("addToCart");
    expect(refs.totalItems.value).toBe(1);
  });

  it("two stores stay isolated but useStore() returns the same instance", () => {
    const cart = useCartStore();
    const auth = useAuthStore();

    expect(cart.totalItems).toBe(0);
    expect(auth.isAuthenticated).toBe(false);
    expect(useCartStore()).toBe(cart);
  });

  it("$reset() EXISTS on a setup store but throws (dev)", () => {
    const cart = useCartStore();

    expect(typeof (cart as unknown as { $reset: unknown }).$reset).toBe("function");
    expect(() => (cart as unknown as { $reset: () => void }).$reset()).toThrow(/setup syntax/);
  });

  it("$patch and $state work on setup stores", () => {
    const cart = useCartStore();
    cart.addToCart(makeProduct(1, 5));
    cart.$patch({ items: [] });
    expect(cart.totalItems).toBe(0);
    expect(cart.$state).toMatchObject({ items: [] });
  });
});

describe("2. async actions", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("login() awaits the whole flow and flips isLoading around it", async () => {
    const auth = useAuthStore();

    const promise = auth.login({ email: "admin", password: "admin123" });
    expect(auth.isLoading).toBe(true);

    await promise;
    expect(auth.isLoading).toBe(false);
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.isAdmin).toBe(true);
  });

  it("login() rejects and finally still clears isLoading", async () => {
    const auth = useAuthStore();

    await expect(auth.login({ email: "nope", password: "x" })).rejects.toThrow(/invalid email/i);
    expect(auth.isLoading).toBe(false);
    expect(auth.isAuthenticated).toBe(false);
  });
});

describe("3. persistence patterns", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("A. deep watch in the store persists the cart (needs a tick)", async () => {
    const cart = useCartStore();
    cart.addToCart(makeProduct(7, 5));

    expect(localStorage.getItem("mini_ecommerce_cart")).toBeNull();
    await nextTick();
    const raw = localStorage.getItem("mini_ecommerce_cart");
    expect(JSON.parse(raw as string)[0].product.id).toBe(7);
  });

  it("B. $subscribe = persist selected fields + hydrate on boot", async () => {
    const usePrefs = defineStore("prefs", () => {
      const theme = ref<"light" | "dark">("light");
      const sidebar = ref(true);
      const label = computed(() => `theme:${theme.value}`);
      function toggleTheme() {
        theme.value = theme.value === "light" ? "dark" : "light";
      }
      return { theme, sidebar, label, toggleTheme };
    });

    // The plugin shape: hydrate from storage, then write back only chosen keys.
    function persistPrefs(store: ReturnType<typeof usePrefs>) {
      const key = "pinia:prefs";
      const saved = localStorage.getItem(key);
      if (saved) store.$patch(JSON.parse(saved) as { theme: "light" | "dark" });
      store.$subscribe((_mutation, state) => {
        localStorage.setItem(key, JSON.stringify({ theme: state.theme }));
      });
    }

    const prefs = usePrefs();
    persistPrefs(prefs);
    prefs.sidebar = false; // ignored on purpose
    prefs.toggleTheme();
    await nextTick();

    expect(prefs.theme).toBe("dark");
    expect(JSON.parse(localStorage.getItem("pinia:prefs") as string)).toEqual({ theme: "dark" });

    // Fresh pinia = fresh page load: hydration from storage kicks in.
    setActivePinia(createPinia());
    const restored = usePrefs();
    persistPrefs(restored);

    expect(restored.theme).toBe("dark"); // persisted
    expect(restored.sidebar).toBe(true); // not persisted -> default
  });

  it("C. skipHydrate keeps local-only refs out of hydration", () => {
    const useSearch = defineStore("search", () => {
      const results = ref<string[]>([]);
      const draft = skipHydrate(ref(""));
      return { results, draft };
    });

    const store = useSearch();
    expect(store.draft).toBe("");
  });
});

describe("4. $onAction / $subscribe for cross-cutting concerns", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("$onAction wraps async actions with after/onError hooks", async () => {
    const events: string[] = [];
    const auth = useAuthStore();

    const off = auth.$onAction(({ name, after, onError }) => {
      events.push(`start:${name}`);
      after(() => events.push(`after:${name}`));
      onError(() => events.push(`error:${name}`));
    });

    await auth.login({ email: "admin", password: "admin123" });
    await expect(auth.login({ email: "bad", password: "bad" })).rejects.toThrow(/invalid email/i);
    off();

    expect(events).toEqual(["start:login", "after:login", "start:login", "error:login"]);
  });

  it("$subscribe: default flush is async, flush:'sync' is immediate, $patch is sync", async () => {
    const cart = useCartStore();
    const asyncSpy = vi.fn<() => void>();
    const syncSpy = vi.fn<() => void>();

    cart.$subscribe(asyncSpy, { detached: true }); // default flush: 'pre'
    cart.$subscribe(syncSpy, { detached: true, flush: "sync" });

    cart.addToCart(makeProduct(1, 5));
    expect(syncSpy).toHaveBeenCalled();
    expect(asyncSpy).not.toHaveBeenCalled();

    await nextTick();
    expect(asyncSpy).toHaveBeenCalled();

    const patchSpy = vi.fn<() => void>();
    cart.$subscribe(patchSpy, { detached: true });
    cart.$patch({ items: [] });
    expect(patchSpy).toHaveBeenCalled(); // $patch fires direct subs without a tick
  });
});
