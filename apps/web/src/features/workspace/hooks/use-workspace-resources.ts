import { useQuery } from '@tanstack/react-query';

import { API_ROUTES } from '@repo/constants';
import type { ApiResponse, WorkspaceResource } from '@repo/types';

import { api } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useWorkspaceResources(
  workspaceId: string,
): ReturnType<typeof useQuery<WorkspaceResource[]>> {
  return useQuery<WorkspaceResource[]>({
    queryKey: QUERY_KEYS.workspaceResources.list(workspaceId),
    queryFn: async () => {
      const response = await api.get<unknown, ApiResponse<WorkspaceResource[]>>(
        `/${API_ROUTES.RESOURCES.BASE.replace(':workspaceId', workspaceId)}`,
      );
      return response.data ?? [];
    },
    enabled: !!workspaceId,
  });
}
