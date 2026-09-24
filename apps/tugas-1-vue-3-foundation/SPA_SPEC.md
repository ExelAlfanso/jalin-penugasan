# Single Page Application (SPA) Context Engineering Blueprint

> **Target Stack**: Vue 3.5+ (`<script setup lang="ts">`), Pinia 4+, Vue Router 5+, Vite 8+, TypeScript 6+, Tailwind CSS + shadcn-vue  
> **Storage / DB**: Browser `localStorage` (Client-side Mock Database)  
> **Reference Workspace**: [tugas-1-vue-3-foundation](file:///C:/Users/thecl/onedrive/documents/projects/tugas-1-vue-3-foundation)

---

## 0. Mandatory Agent Pre-Flight & Skill Protocol

> [!IMPORTANT]
> **RULES FOR AI AGENTS**: Before executing any code changes, creating any files, or running tasks outlined in this specification, the AI agent **MUST** execute the following pre-flight steps:

### 0.1 Read Project Guidelines First
* **Mandatory File**: Read [`AGENTS.md`](file:///C:/Users/thecl/onedrive/documents/projects/tugas-1-vue-3-foundation/AGENTS.md) **FIRST**.
* **Enforce Project Conventions**:
  * Directory layout: `src/{components,composables,directives,layouts,pages,router,stores,services,types,utils,styles}`.
  * Component naming: `PascalCase.vue`, base UI prefix `BaseXxx.vue` (or `components/ui/` for shadcn primitives).
  * Props in `camelCase`, Emits in `kebab-case` (`update:modelValue`, `submit`, `close`).
  * Maximum 300 lines per file (split into sub-components if larger).
  * Strictly `<script setup lang="ts">`.
  * Formatting & linting adherence: Prettier (`singleQuote: false`, `semi: true`, `vueIndentScriptAndStyle: true`).

### 0.2 Required Agent Skills
Any AI agent executing this specification must activate and adhere to these specialized skill guides:

1. **Vue.js Skills (`vue-best-practices`, `vue-router-best-practices`, `vue-pinia-best-practices`, `create-adaptable-composable`)**:
   - MUST use Composition API with `<script setup lang="ts">`.
   - Setup stores in Pinia (`defineStore('id', () => { ... })`).
   - Vue Router navigation guards with typed `route.meta`.
   - Reusable composables accepting `MaybeRefOrGetter` inputs with `toValue()` normalization.
2. **Ponytail Skills (`ponytail`, `ponytail-review`, `ponytail-audit`)**:
   - Zero unnecessary abstractions, premature generalizations, or bloated wrapper classes.
   - Keep code lean, surgical, and focused only on the current requirement.
   - Run a ponytail review mindset: *What can be deleted or kept simpler?*
3. **Caveman & Cavecrew Skills (`caveman`, `cavecrew`, `cavecrew-builder`)**:
   - Optimize token usage and context economy during execution.
   - Use surgical edits preserving exact formatting without unnecessary full-file churn.
   - Delegate bounded 1-2 file tasks to `cavecrew-builder` subagents where appropriate to preserve main conversation context.

---

## 1. UI Component Library: shadcn-vue Integration

To ensure a polished, accessible, and maintainable dashboard, the application uses **shadcn-vue** (Radix Vue primitives + Tailwind CSS).

### 1.1 Mandatory Dashboard Components to Install
The AI agent **must initialize and install the required shadcn-vue components** rather than hand-crafting complex raw UI widgets.

```bash
# 1. Initialize shadcn-vue (if not yet configured)
npx shadcn-vue@latest init

# 2. Install essential dashboard components
npx shadcn-vue@latest add button card input label badge table dialog dropdown-menu select sheet sonner
```

### 1.2 Dashboard Component Mapping
| Dashboard Requirement | shadcn-vue Component | Role / Usage |
| :--- | :--- | :--- |
| **Action triggers & state buttons** | `Button` | Submit, edit, delete, pagination triggers |
| **Metrics & widget containers** | `Card`, `CardHeader`, `CardTitle`, `CardContent` | KPI summary cards, login container, detail views |
| **Form inputs & authentication** | `Input`, `Label` | Email, password, search filter bars |
| **Resource data display** | `Table`, `TableHeader`, `TableRow`, `TableCell` | High-density data grid with sortable columns |
| **Status indicators** | `Badge` | Displaying task/bug/feature category tags & auth roles |
| **Modals & detail overlays** | `Dialog`, `DialogContent`, `DialogHeader` | Create/edit resource modals, confirmation prompts |
| **Context & action menus** | `DropdownMenu`, `DropdownMenuItem` | Row-level action menus (Edit, Delete, Copy Link) |
| **Filter selection** | `Select`, `SelectTrigger`, `SelectContent` | Category and status dropdown filters |
| **Mobile sidebar / drawer** | `Sheet`, `SheetContent` | Responsive navigation drawer for mobile views |
| **Feedback & alerts** | `Sonner` (Toaster) | Instant toast notifications for auto-save and errors |

---

## 2. Global Context Frame (System Rules & Boundaries)

When prompting or directing an AI agent (or a development team), this section establishes the non-negotiable architectural anchors.

### 2.1 Invariant Architecture Rules
1. **Composition API Only**: All components strictly use `<script setup lang="ts">`. No Options API.
2. **Reactivity Contracts**:
   - Derived state **must** use `computed()` (pure functions, zero side effects).
   - Async calls, timers, and storage persistence **must** live inside `watch()` or Pinia actions.
   - Use `onCleanup` for any watcher handling async or cancellable operations.
3. **One-Way Data Flow**: Props are strictly read-only. Two-way synchronization must be implemented via `v-model` with `defineModel()` or explicit writable `computed` / `$emit`.
4. **Local Database Invariant**: All data persistence (auth session, user profile, workspace tasks) uses `localStorage` keys (`app_auth_token`, `app_auth_user`, `app_workspace_items`). No external backend API server required.

### 2.2 Target Directory Hierarchy (Per AGENTS.md + shadcn-vue)
```text
src/
├── assets/                  # Images, icons, fonts
├── components/              # Reusable components
│   ├── ui/                  # Installed shadcn-vue components (Button, Card, Table, Dialog)
│   ├── Base/                # Custom pure UI components (BaseModal.vue, BaseStatusBadge.vue)
│   └── Feature/             # Feature-specific dumb components (Auth/LoginForm.vue)
├── composables/             # useXxx.ts (reusable stateful logic)
├── directives/              # Custom Vue directives
├── layouts/                 # Shell layouts containing <RouterView /> (DefaultLayout.vue, AuthLayout.vue)
├── pages/                   # Route-level / view components (DashboardPage.vue, LoginPage.vue)
├── router/                  # router/index.ts, guards/
├── stores/                  # Pinia stores (useAuthStore.ts, useWorkspaceStore.ts)
├── services/                # LocalStorage DB adapters (authStorage.ts, workspaceStorage.ts)
├── types/                   # Universal TypeScript interfaces & domain models
├── utils/                   # Small pure helpers (camelCase.ts)
└── styles/                  # Global CSS/SCSS, tokens, tailwind.css
```

---

## 3. Feature 1 Breakdown: Authentication & Protected Route Engine (LocalStorage DB)

* **Feature Goal**: Simple credential validation for admin, session persistence via `localStorage`, and route guard protection.
* **Context Scope**: Encapsulated within `stores/useAuthStore.ts`, `services/authStorage.ts`, and `router/guards/auth.ts`.
* **Credentials Specification**:
  * **Admin Email**: `admin@example.com` (or `admin`)
  * **Admin Password**: `admin123`
  * **Role Assigned**: `'admin'`

### 3.1 Domain & State Contracts (`src/types/auth.ts`)
```ts
export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin'
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

### 3.2 Storage Service (`src/services/authStorage.ts`)
```ts
import type { UserProfile, LoginPayload } from '@/types/auth'

const AUTH_TOKEN_KEY = 'app_auth_token'
const AUTH_USER_KEY = 'app_auth_user'

export const authStorage = {
  // Simple credential validation
  validateCredentials(payload: LoginPayload): UserProfile {
    const isValidAdmin =
      (payload.email === 'admin@example.com' || payload.email === 'admin') &&
      payload.password === 'admin123'

    if (!isValidAdmin) {
      throw new Error('Invalid email or password. Use admin / admin123.')
    }

    return {
      id: 'admin-01',
      name: 'System Admin',
      email: 'admin@example.com',
      role: 'admin',
    }
  },

  getSession(): { token: string | null; user: UserProfile | null } {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const rawUser = localStorage.getItem(AUTH_USER_KEY)
    return {
      token,
      user: rawUser ? JSON.parse(rawUser) : null,
    }
  },

  setSession(token: string, user: UserProfile): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  },

  clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  },
}
```

### 3.3 Store Specification (`src/stores/useAuthStore.ts`)
```ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authStorage } from '@/services/authStorage'
import type { UserProfile, LoginPayload } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const initialSession = authStorage.getSession()

  const token = ref<string | null>(initialSession.token)
  const user = ref<UserProfile | null>(initialSession.user)
  const isLoading = ref<boolean>(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(payload: LoginPayload): Promise<void> {
    isLoading.value = true
    try {
      // Simulate micro-delay for realistic UI feedback
      await new Promise((resolve) => setTimeout(resolve, 300))
      const validatedUser = authStorage.validateCredentials(payload)
      const mockToken = `mock-admin-token-${Date.now()}`

      token.value = mockToken
      user.value = validatedUser
      authStorage.setSession(mockToken, validatedUser)
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    token.value = null
    user.value = null
    authStorage.clearSession()
  }

  return { token, user, isLoading, isAuthenticated, isAdmin, login, logout }
})
```

### 3.4 Router Integration & Navigation Guards (`src/router/guards/auth.ts`)
```ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  next()
}
```

---

## 4. Feature 2 Breakdown: Dynamic Resource Workspace (LocalStorage DB)

* **Feature Goal**: An admin workspace storing tasks/resources directly in `localStorage` with reactive `computed` filtering, debounced `watch` auto-save, and custom table presentation.
* **Context Scope**: Encapsulated within `stores/useWorkspaceStore.ts`, `services/workspaceStorage.ts`, and `pages/workspace/`.

### 4.1 Domain & State Contracts (`src/types/workspace.ts`)
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

### 4.2 LocalStorage Database Adapter (`src/services/workspaceStorage.ts`)
```ts
import type { WorkspaceItem } from '@/types/workspace'

const STORAGE_KEY = 'app_workspace_items'

const INITIAL_SEEDS: WorkspaceItem[] = [
  {
    id: 'task-1',
    title: 'Setup Navigation Guards',
    content: 'Ensure all admin routes are protected by authGuard.',
    category: 'feature',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Fix LocalStorage Sync on Refresh',
    content: 'Verify that Pinia rehydrates properly from browser storage.',
    category: 'bug',
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

export const workspaceStorage = {
  getItems(): WorkspaceItem[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDS))
      return INITIAL_SEEDS
    }
    return JSON.parse(raw)
  },

  saveItems(items: WorkspaceItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  },
}
```

### 4.3 Reactivity Engine Specification
1. **Filtering & Sorting (`computed`)**:
   ```ts
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

2. **Debounced Auto-Save with LocalStorage Sync (`watch`)**:
   ```ts
   // Sync items state to localStorage whenever items are added, edited, or removed
   watch(
     items,
     (newItems) => {
       workspaceStorage.saveItems(newItems)
     },
     { deep: true }
   )
   ```

---

## 5. Context Engineering: Agent Prompting Protocol

To execute this plan with an AI assistant without context pollution or drift, pass instructions in bounded modules:

### Prompt Template 1: shadcn Setup & Auth Implementation
> *"Act as a Vue 3 TypeScript engineer. First, read `AGENTS.md` and load `vue-best-practices`, `ponytail`, and `caveman` skills. Refer to Section 1 & 3 of `SPA_SPEC.md`. Initialize shadcn-vue and install the dashboard components. Implement simple admin auth (`admin` / `admin123`) with localStorage persistence in `src/services/authStorage.ts` and `src/stores/useAuthStore.ts`. Setup the router guard in `src/router/guards/auth.ts`. Verify with `npm run type-check`."*

### Prompt Template 2: UI Dashboard & Workspace Implementation
> *"Now implement the presentation layer and Feature 2 using the installed shadcn-vue components and LocalStorage DB adapter (`src/services/workspaceStorage.ts`). Consult `AGENTS.md` for component conventions. Build `LoginForm.vue` using shadcn `Card`, `Input`, and `Button`. Build `ResourceTable.vue` with scoped slots. Verify with `npm run lint` and `npm run test:unit`."*

---

## 6. Verification & Acceptance Checklist

| Step | Command | Expected Outcome |
| :--- | :--- | :--- |
| **Pre-requisite Check**| Review [`AGENTS.md`](file:///C:/Users/thecl/onedrive/documents/projects/tugas-1-vue-3-foundation/AGENTS.md) | Conventions & folder structure aligned |
| **UI Library Check** | `ls src/components/ui` | shadcn-vue components present |
| **Admin Auth Check** | Run login with `admin` / `admin123` | Generates session in `localStorage.app_auth_token` |
| **Invalid Auth Check**| Run login with wrong password | Throws validation error; does not redirect |
| **Type Integrity** | `npm run type-check` | Zero `vue-tsc` diagnostics |
| **Lint & Format** | `npm run lint` | ESLint + Oxlint clean |
| **LocalStorage Refresh**| Hard reload on `/workspace` | Session and workspace items persist without 404 |
