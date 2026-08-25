import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

interface PairingResponse {
  data: {
    code: string;
    expiresIn: number;
  };
}

export const usePairing = (): UseMutationResult<
  { code: string; expiresIn: number },
  Error,
  void
> => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<never, PairingResponse>('/agent/pairing-code');
      return response.data;
    },
  });
};
