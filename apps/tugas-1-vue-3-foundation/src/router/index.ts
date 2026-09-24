import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import { authGuard } from "@/router/guards/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: { name: "dashboard" },
  },
  // {
  //   path: "/playground",
  //   name: "playground",
  //   component: () => import("@/pages/PlaygroundPage.vue"),
  // },
  {
    path: "/",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/pages/DashboardPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "workspace",
        name: "workspace",
        component: () => import("@/pages/workspace/WorkspacePage.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("@/pages/LoginPage.vue"),
        meta: { guestOnly: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "dashboard" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(authGuard);

export default router;
