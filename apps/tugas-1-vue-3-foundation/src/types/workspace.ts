export interface WorkspaceItem {
  id: string;
  title: string;
  content: string;
  category: "feature" | "bug" | "task";
  updatedAt: string;
}

export interface WorkspaceFilters {
  query: string;
  category: WorkspaceItem["category"] | "all";
  sortBy: "title" | "updatedAt";
}
