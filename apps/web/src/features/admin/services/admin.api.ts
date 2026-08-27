import { API_ROUTES } from '@repo/constants';
import type { ApiResponse } from '@repo/types';

import { api } from '@/lib/api';

export interface QueueJob {
  id: string;
  name: string;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  progress: number;
}

export interface QueueStats {
  counts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
  jobs: {
    active: QueueJob[];
    waiting: QueueJob[];
    failed: QueueJob[];
    delayed: QueueJob[];
  };
}

export const adminApi = {
  getQueueStats: async (): Promise<QueueStats> => {
    const response = await api.get<unknown, ApiResponse<QueueStats>>(
      `/${API_ROUTES.ADMIN.BASE}/${API_ROUTES.ADMIN.QUEUES_STATS}`,
    );
    if (!response.data) {
      throw new Error('No queue stats returned');
    }
    return response.data;
  },
};
