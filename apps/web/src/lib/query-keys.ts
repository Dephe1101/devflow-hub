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
  notes: {
    all: ['notes'] as const,
    lists: () => [...QUERY_KEYS.notes.all, 'list'] as const,
    list: (workspaceId: string, filters?: Record<string, unknown>) =>
      filters
        ? ([...QUERY_KEYS.notes.lists(), workspaceId, filters] as const)
        : ([...QUERY_KEYS.notes.lists(), workspaceId] as const),
    details: () => [...QUERY_KEYS.notes.all, 'detail'] as const,
    detail: (workspaceId: string, id: string) =>
      [...QUERY_KEYS.notes.details(), workspaceId, id] as const,
  },
} as const;
