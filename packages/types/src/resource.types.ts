export interface Resource {
  id: string;
  createdByUserId: string;
  type: string;
  value: string;
  displayName: string | null;
  faviconUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceResource {
  id: string;
  workspaceId: string;
  resourceId: string;
  sortOrder: number;
  isEnabled: boolean;
  resource: Resource;
}
