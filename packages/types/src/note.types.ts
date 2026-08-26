export interface Note {
  id: string;
  workspaceId: string;
  resourceId: string | null;
  title: string;
  content: string | null;
  type: string;
  category: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
