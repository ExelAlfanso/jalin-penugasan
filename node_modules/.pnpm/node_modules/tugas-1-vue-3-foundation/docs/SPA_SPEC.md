# Single Page Application (SPA) Context Engineering Blueprint

> **Target Stack**: Vue 3.5+ (`<script setup lang="ts">`), Pinia 4+, Vue Router 5+, Vite 8+, TypeScript 6+  
> **Reference Workspace**: [tugas-1-vue-3-foundation](file:///C:/Users/thecl/onedrive/documents/projects/tugas-1-vue-3-foundation)

---

## 1. Global Context Frame (System Rules & Boundaries)

When prompting or directing an AI agent (or a development team), this section establishes the non-negotiable architectural anchors.

### 1.1 Invariant Architecture Rules
1. **Composition API Only**: All components strictly use `<script setup lang="ts">`. No Options API.
2. **Reactivity Contracts**:
   - Derived state **must** use `computed()` (pure functions, zero side effects).
   - Async calls, timers, and storage persistence **must** live inside `watch()` or Pinia actions.
   - Use `onCleanup` for any watcher handling async or cancellable operations.
3. **One-Way Data Flow**: Props are strictly read-only. Two-way synchronization must be implemented via `v-model` with `defineModel()` or explicit writable `computed` / `$emit`.
4. **Isolated Feature Boundaries**: Features must not import internal components from other features; shared utilities live in `@/components/common` or `@/composables`.

### 1.2 Target Directory Hierarchy
```text
src/
├── assets/                  # Static styles, SVGs, global CSS
├── components/
│   └── common/              # Dumb, presentation-only components (Modals, Inputs, Cards)
├── composables/             # Reusable stateful logic (useDebounce, useNetwork)
├── layouts/                 # Shell layouts containing <RouterView />
│   ├── AppLayout.vue        # Authenticated shell (Sidebar + Header + Content)
│   └── AuthLayout.vue       # Minimal centered card shell
├── router/
│   ├── index.ts             # Route definitions & navigation guards
│   └── routes.ts            # Route record declarations & meta types
├── stores/                  # Pinia global stores
├── types/                   # Universal TypeScript interfaces & domain models
└── views/                   # Route-level (Smart/Container) components
```

---

## 2. Feature 1 Breakdown: Authentication & Protected Route Engine

* **Feature Goal**: Establish session state, JWT persistence, login flow, and declarative route protection with redirect preservation.
* **Context Scope**: Encapsulated within `stores/auth.ts`, `router/guards/auth.ts`, and `views/auth/`.

### 2.1 Domain & State Contracts (`src/types/auth.ts`)
```ts
export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

export interface AuthState {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
}

export interface LoginPayload {
  email: string
  password: string
}
```

### 2.2 Store Specification (`src/stores/auth.ts`)
* **State**:
  * `token`: `ref<string | null>(localStorage.getItem('auth_token'))`
  * `user`: `ref<UserProfile | null>(null)`
  * `isLoading`: `ref<boolean>(false)`
* **Getters (Computed)**:
  * `isAuthenticated`: `computed(() => Boolean(token.value))`
  * `isAdmin`: `computed(() => user.value?.role === 'admin')`
* **Actions**:
  * `login(payload: LoginPayload): Promise<void>`: Calls auth API, sets `token`, persists to `localStorage`, and fetches user profile.
  * `logout(): void`: Clears memory state, purges `localStorage`, and pushes route to `/login`.

### 2.3 Router Integration & Navigation Guards (`src/router/guards/auth.ts`)
```ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Preserve target path for post-login redirection
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  next()
}
```

### 2.4 Component Contract (Smart vs. Dumb Split)
* **`views/auth/LoginView.vue` (Smart)**:
  * Ingests `useAuthStore()`.
  * Reads `route.query.redirect` to route the user upon successful login.
  * Passes `isLoading` and error messages down to the form.
* **`components/auth/LoginForm.vue` (Dumb)**:
  * **Props**: `isLoading: boolean`, `errorMessage?: string`
  * **Emits**: `(e: 'submit', payload: LoginPayload): void`
  * **Behavior**: Validates email/password format locally before emitting.

---

## 3. Feature 2 Breakdown: Dynamic Resource Workspace with Auto-Save

* **Feature Goal**: A high-density resource view with instant computed multi-filter/sorting, debounced background persistence, and custom presentation slots.
* **Context Scope**: Encapsulated within `stores/workspace.ts`, `views/workspace/`, and `components/common/`.

### 3.1 Domain & State Contracts (`src/types/workspace.ts`)
```ts
export interface WorkspaceItem {
  id: string
  title: string
  content: string
  category: 'feature' | 'bug' | 'task'
  updatedAt: string
}

export interface WorkspaceFilters {
  query: string
  category: WorkspaceItem['category'] | 'all'
  sortBy: 'title' | 'updatedAt'
}
```

### 3.2 Reactivity Engine Specification
1. **Filtering & Slicing (`computed`)**:
   ```ts
   // Pure derivation: recalculates only when items or filters change
   const filteredItems = computed(() => {
     return items.value
       .filter((item) => {
         const matchesQuery = item.title.toLowerCase().includes(filters.query.toLowerCase())
         const matchesCat = filters.category === 'all' || item.category === filters.category
         return matchesQuery && matchesCat
       })
       .sort((a, b) => (filters.sortBy === 'title' ? a.title.localeCompare(b.title) : b.updatedAt.localeCompare(a.updatedAt)))
   })
   ```

2. **Debounced Auto-Save with Cancellation (`watch`)**:
   ```ts
   // Side effect: persists current draft to backend/storage after 800ms idle
   watch(activeItem, (newDraft, _, onCleanup) => {
     if (!newDraft) return
     const controller = new AbortController()
     onCleanup(() => controller.abort())

     const timer = setTimeout(async () => {
       await saveItemDraft(newDraft, controller.signal)
     }, 800)

     onCleanup(() => clearTimeout(timer))
   }, { deep: true })
   ```

### 3.3 Component Architecture & Slot Contracts
* **`components/common/ResourceTable.vue` (Dumb Table with Scoped Slots)**:
  * **Props**: `items: WorkspaceItem[]`, `selectedId?: string`
  * **Emits**: `(e: 'select', id: string): void`, `(e: 'delete', id: string): void`
  * **Slots (`defineSlots`)**:
    * `#header`: Custom top actions or breadcrumbs.
    * `#item-actions="{ item }"`: Scoped slot exposing the row item to let the parent customize buttons/menus per row.
* **`views/workspace/WorkspaceView.vue` (Smart Coordinator)**:
  * Connects to `useWorkspaceStore()`.
  * Houses the search input and category filter toggles.
  * Feeds `filteredItems` to `<ResourceTable>`.

---

## 4. Context Engineering: Agent Prompting Protocol

To execute this plan with an AI assistant (or subagent) without context pollution or drift, pass instructions in bounded modules:

### Prompt Template 1: Feature Scaffolding
> *"Act as a Vue 3 TypeScript engineer. Refer to Section 1 of the SPA Blueprint for stack constraints. Implement Feature 1 (Authentication): create `src/types/auth.ts`, `src/stores/auth.ts` using Pinia setup syntax, and the navigation guard in `src/router/guards/auth.ts`. Do not touch or implement UI components yet. Validate by running `npm run type-check`."*

### Prompt Template 2: UI & Component Implementation
> *"Now implement the presentation layer for Feature 1. Create `src/components/auth/LoginForm.vue` as a dumb component (props: `isLoading`, emits: `submit`) and `src/views/auth/LoginView.vue` as the coordinator. Adhere strictly to the one-way data flow rules. Verify with `npm run lint`."*

---

## 5. Verification & Acceptance Checklist

| Step | Command | Expected Outcome |
| :--- | :--- | :--- |
| **Type Integrity** | `npm run type-check` | Zero `vue-tsc` diagnostics |
| **Lint & Format** | `npm run lint` | ESLint + Oxlint clean |
| **Unit Verification** | `npm run test:unit` | Store getters and watcher logic pass |
| **Browser SPA Flow** | `npm run dev` | Deep linking `/workspace` redirects to `/login` with preserved query |
