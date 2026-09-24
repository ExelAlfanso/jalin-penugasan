import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import { authGuard } from "@/router/guards/auth";

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: { name: "products" } },
  {
    path: "/",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      { path: "products", name: "products", component: () => import("@/pages/ProductListPage.vue"), meta: { requiresAuth: true } },
      { path: "products/:id", name: "product-detail", component: () => import("@/pages/ProductDetailPage.vue"), meta: { requiresAuth: true } },
      { path: "cart", name: "cart", component: () => import("@/pages/CartPage.vue"), meta: { requiresAuth: true } },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [{ path: "login", name: "login", component: () => import("@/pages/LoginPage.vue"), meta: { guestOnly: true } }],
  },
  { path: "/:pathMatch(.*)*", redirect: { name: "products" } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(authGuard);

export default router;
