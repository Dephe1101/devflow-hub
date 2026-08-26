export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  SETTINGS_AGENT: '/settings/agent',
  WORKSPACE: (id: string) => `/dashboard/workspaces/${id}`,
} as const;
