import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ApiResponse } from '@repo/types';

import { api } from '@/lib/api';

interface LaunchPayload {
  action: 'open_folder' | 'launch_app';
  path?: string;
  appName?: string;
}

export function useAgentLaunch(): UseMutationResult<ApiResponse<void>, Error, LaunchPayload> {
  return useMutation({
    mutationFn: async (payload: LaunchPayload) => {
      const response = await api.post<unknown, ApiResponse<void>>('/agent/launch', payload);
      return response;
    },
  });
}
