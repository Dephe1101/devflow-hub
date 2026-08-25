import { useQuery } from '@tanstack/react-query';

import { API_ROUTES } from '@repo/constants';
import type { ApiResponse, WorkspaceResource } from '@repo/types';

import { api } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth.store';

export function useGlobalResources(): ReturnType<typeof useQuery<WorkspaceResource[]>> {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<WorkspaceResource[]>({
    queryKey: QUERY_KEYS.workspaceResources.all,
    queryFn: async () => {
      const response = await api.get<unknown, ApiResponse<WorkspaceResource[]>>(
        `/${API_ROUTES.RESOURCES.GLOBAL}`,
      );
      return response.data ?? [];
    },
    enabled: isAuthenticated,
  });
}
