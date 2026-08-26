export const API_ROUTES = {
  AUTH: {
    BASE: 'auth',
    LOGIN: 'login',
    REGISTER: 'register',
    REFRESH: 'refresh',
    LOGOUT: 'logout',
    ME: 'me',
  },
  WORKSPACES: {
    BASE: 'workspaces',
  },
  RESOURCES: {
    GLOBAL: 'resources',
    BASE: 'workspaces/:workspaceId/resources', // Fastify/NestJS param style
    REORDER: 'workspaces/:workspaceId/resources/reorder',
    DETAIL: 'workspaces/:workspaceId/resources/:resourceId',
  },
  NOTES: {
    BASE: 'workspaces/:workspaceId/notes',
    DETAIL: 'workspaces/:workspaceId/notes/:noteId',
  },
} as const;
