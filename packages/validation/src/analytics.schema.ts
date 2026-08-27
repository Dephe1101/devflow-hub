import { z } from 'zod';

import { LAUNCH_STATUS, VALIDATION_MESSAGES } from '@repo/constants';

export const CreateLaunchLogSchema = z.object({
  workspaceId: z.string().uuid(VALIDATION_MESSAGES.ANALYTICS.INVALID_WORKSPACE_ID),
  webUrlsOpened: z.number().int().min(0).default(0),
  localPathsOpened: z.number().int().min(0).default(0),
  failedCount: z.number().int().min(0).default(0),
  status: z.nativeEnum(LAUNCH_STATUS),
});

export type CreateLaunchLogInput = z.infer<typeof CreateLaunchLogSchema>;
