<script setup lang="ts">
  import { LayoutDashboard, ListTodo, LogOut, Menu } from "@lucide/vue";
  import { storeToRefs } from "pinia";
  import { shallowRef } from "vue";
  import { RouterLink, RouterView, useRouter } from "vue-router";

  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
  import { useAuthStore } from "@/stores/useAuthStore";

  const navigation = [
    { name: "Dashboard", route: "dashboard", icon: LayoutDashboard },
    { name: "Workspace", route: "workspace", icon: ListTodo },
  ];

  const router = useRouter();
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);
  const mobileMenuOpen = shallowRef(false);

  async function logout() {
    authStore.logout();
    await router.replace({ name: "login" });
  }
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <header class="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Sheet v-model:open="mobileMenuOpen">
          <SheetTrigger as-child>
            <Button class="md:hidden" size="icon" variant="outline" aria-label="Open navigation">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-72">
            <SheetTitle>Admin Workspace</SheetTitle>
            <nav class="mt-8 grid gap-2">
              <RouterLink
                v-for="item in navigation"
                :key="item.route"
                :to="{ name: item.route }"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                active-class="bg-muted text-foreground"
                @click="mobileMenuOpen = false"
              >
                <component :is="item.icon" class="size-4" />
                {{ item.name }}
              </RouterLink>
            </nav>
          </SheetContent>
        </Sheet>

        <RouterLink :to="{ name: 'dashboard' }" class="font-semibold tracking-tight">
          Admin Workspace
        </RouterLink>

        <nav class="hidden items-center gap-1 md:flex">
          <RouterLink
            v-for="item in navigation"
            :key="item.route"
            :to="{ name: item.route }"
            class="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            active-class="bg-muted text-foreground"
          >
            {{ item.name }}
          </RouterLink>
        </nav>

        <div class="ml-auto flex items-center gap-3">
          <div class="hidden text-right sm:block">
            <p class="text-sm font-medium">{{ user?.name }}</p>
            <p class="text-xs text-muted-foreground">{{ user?.email }}</p>
          </div>
          <Badge variant="secondary">{{ user?.role }}</Badge>
          <Button size="icon" variant="ghost" aria-label="Log out" @click="logout">
            <LogOut />
          </Button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>
