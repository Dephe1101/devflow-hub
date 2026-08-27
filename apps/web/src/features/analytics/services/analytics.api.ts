import { API_ROUTES } from '@repo/constants';
import type { ApiResponse, Workspace } from '@repo/types';
import type { CreateLaunchLogInput } from '@repo/validation';

import { api } from '@/lib/api';

export const analyticsApi = {
  createLaunchLog: async (data: CreateLaunchLogInput): Promise<void> => {
    await api.post(`/${API_ROUTES.ANALYTICS.BASE}/${API_ROUTES.ANALYTICS.LAUNCH_LOG}`, data);
  },

  getRecentWorkspaces: async (): Promise<Workspace[]> => {
    const response = await api.get<unknown, ApiResponse<Workspace[]>>(
      `/${API_ROUTES.ANALYTICS.BASE}/${API_ROUTES.ANALYTICS.RECENT}`,
    );
    return response.data ?? [];
  },

  getMostUsedWorkspaces: async (): Promise<Workspace[]> => {
    const response = await api.get<unknown, ApiResponse<Workspace[]>>(
      `/${API_ROUTES.ANALYTICS.BASE}/${API_ROUTES.ANALYTICS.MOST_USED}`,
    );
    return response.data ?? [];
  },
};
