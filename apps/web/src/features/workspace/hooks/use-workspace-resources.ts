import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { API_ROUTES } from '@repo/constants';
import type { ApiResponse, WorkspaceResource } from '@repo/types';
import type { UpdateResourceInput } from '@repo/validation';

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

export function useDeleteResource(workspaceId: string): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resourceId: string) => {
      const route = API_ROUTES.RESOURCES.DETAIL.replace(':workspaceId', workspaceId).replace(
        ':resourceId',
        resourceId,
      );
      await api.delete(`/${route}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.workspaceResources.list(workspaceId),
      });
    },
  });
}

export function useUpdateResource(
  workspaceId: string,
): UseMutationResult<
  WorkspaceResource | undefined,
  Error,
  { resourceId: string; data: UpdateResourceInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ resourceId, data }: { resourceId: string; data: UpdateResourceInput }) => {
      const route = API_ROUTES.RESOURCES.DETAIL.replace(':workspaceId', workspaceId).replace(
        ':resourceId',
        resourceId,
      );
      const response = await api.patch<unknown, ApiResponse<WorkspaceResource>>(`/${route}`, data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.workspaceResources.list(workspaceId),
      });
    },
  });
}
