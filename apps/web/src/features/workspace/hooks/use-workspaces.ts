import {
  type UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { API_ROUTES } from '@repo/constants';
import type { ApiResponse, Workspace } from '@repo/types';
import type { UpdateWorkspaceInput } from '@repo/validation';

import { api } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth.store';

export function useWorkspaces(): ReturnType<typeof useQuery<Workspace[]>> {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.workspaces.all,
    queryFn: async () => {
      const response = await api.get<unknown, ApiResponse<Workspace[]>>(
        `/${API_ROUTES.WORKSPACES.BASE}`,
      );
      return response.data ?? [];
    },
    enabled: isAuthenticated,
  });
}

export function useUpdateWorkspace(): UseMutationResult<
  unknown,
  Error,
  { id: string; data: UpdateWorkspaceInput }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWorkspaceInput }) => {
      const res = await api.patch(`/${API_ROUTES.WORKSPACES.BASE}/${id}`, data);
      return res.data as unknown;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces.all });
    },
  });
}
