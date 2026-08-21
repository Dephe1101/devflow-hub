export const QUERY_KEYS = {
  workspaces: {
    all: ['workspaces'] as const,
    lists: () => [...QUERY_KEYS.workspaces.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...QUERY_KEYS.workspaces.lists(), filters] as const,
    details: () => [...QUERY_KEYS.workspaces.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.workspaces.details(), id] as const,
  },
  workspaceResources: {
    all: ['workspaceResources'] as const,
    lists: () => [...QUERY_KEYS.workspaceResources.all, 'list'] as const,
    list: (workspaceId: string) => [...QUERY_KEYS.workspaceResources.lists(), workspaceId] as const,
  },
} as const;
