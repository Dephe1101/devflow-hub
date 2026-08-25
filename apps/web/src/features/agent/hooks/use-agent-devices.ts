import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';

export interface AgentDevice {
  id: string;
  deviceId: string;
  name: string;
  createdAt: string;
  lastSeen: string;
}

export const useAgentDevices = (): UseQueryResult<AgentDevice[]> => {
  return useQuery({
    queryKey: ['agent-devices'],
    queryFn: async () => {
      const response = await api.get<never, { data: AgentDevice[] }>('/agent/devices');
      return response.data;
    },
  });
};

export const useRevokeDevice = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      await api.delete(`/agent/devices/${deviceId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['agent-devices'] });
    },
  });
};
