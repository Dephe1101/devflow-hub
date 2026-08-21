export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  resourceCount: number;
  sortOrder: number;
  isPinned: boolean;
  lastLaunchedAt: string | null;
  createdAt: string;
}
