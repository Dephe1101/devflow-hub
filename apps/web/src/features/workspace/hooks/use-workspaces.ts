import { useQuery } from '@tanstack/react-query';

import { API_ROUTES } from '@repo/constants';
import type { ApiResponse, Workspace } from '@repo/types';

import { api } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useWorkspaces(): ReturnType<typeof useQuery<Workspace[]>> {
  return useQuery({
    queryKey: QUERY_KEYS.workspaces.all,
    queryFn: async () => {
      const response = await api.get<unknown, ApiResponse<Workspace[]>>(
        `/${API_ROUTES.WORKSPACES.BASE}`,
      );
      return response.data ?? [];
    },
  });
}
