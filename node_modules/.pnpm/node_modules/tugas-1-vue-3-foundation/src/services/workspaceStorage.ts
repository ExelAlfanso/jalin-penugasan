import type { WorkspaceItem } from "@/types/workspace";

const STORAGE_KEY = "app_workspace_items";

function createInitialSeeds(): WorkspaceItem[] {
  return [
    {
      id: "task-1",
      title: "Setup Navigation Guards",
      content: "Ensure all admin routes are protected by authGuard.",
      category: "feature",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "task-2",
      title: "Fix LocalStorage Sync on Refresh",
      content: "Verify that Pinia rehydrates properly from browser storage.",
      category: "bug",
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}

function isWorkspaceItem(value: unknown): value is WorkspaceItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<WorkspaceItem>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.content === "string" &&
    (item.category === "feature" || item.category === "bug" || item.category === "task") &&
    typeof item.updatedAt === "string"
  );
}

function seedItems(): WorkspaceItem[] {
  const items = createInitialSeeds();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
}

export const workspaceStorage = {
  getItems(): WorkspaceItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return seedItems();
    }

    try {
      const items: unknown = JSON.parse(raw);
      return Array.isArray(items) && items.every(isWorkspaceItem) ? items : seedItems();
    } catch {
      return seedItems();
    }
  },

  saveItems(items: WorkspaceItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },
};
