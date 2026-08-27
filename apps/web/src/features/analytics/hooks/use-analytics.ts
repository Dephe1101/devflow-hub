import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { TIME_IN_MS } from '@repo/constants';
import type { Workspace } from '@repo/types';
import type { CreateLaunchLogInput } from '@repo/validation';

import { analyticsApi } from '../services/analytics.api';

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  recent: () => [...ANALYTICS_KEYS.all, 'recent'] as const,
  mostUsed: () => [...ANALYTICS_KEYS.all, 'most-used'] as const,
};

export function useRecentWorkspaces(): UseQueryResult<Workspace[]> {
  return useQuery({
    queryKey: ANALYTICS_KEYS.recent(),
    queryFn: analyticsApi.getRecentWorkspaces,
    staleTime: TIME_IN_MS.ONE_MINUTE, // Cache for 1 minute
  });
}

export function useMostUsedWorkspaces(): UseQueryResult<Workspace[]> {
  return useQuery({
    queryKey: ANALYTICS_KEYS.mostUsed(),
    queryFn: analyticsApi.getMostUsedWorkspaces,
    staleTime: 5 * TIME_IN_MS.ONE_MINUTE, // Cache for 5 minutes as requested
  });
}

export function useCreateLaunchLog(): UseMutationResult<void, Error, CreateLaunchLogInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLaunchLogInput) => analyticsApi.createLaunchLog(data),
    onSuccess: () => {
      // Invalidate recent workspaces so the UI updates
      void queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.recent() });
      void queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.mostUsed() });
    },
  });
}
