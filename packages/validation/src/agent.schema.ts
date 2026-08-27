import { z } from 'zod';

import { AGENT_ACTION, VALIDATION_MESSAGES } from '@repo/constants';

export const agentLaunchSchema = z
  .object({
    action: z.nativeEnum(AGENT_ACTION, {
      required_error: VALIDATION_MESSAGES.AGENT.ACTION_REQUIRED,
      invalid_type_error: VALIDATION_MESSAGES.AGENT.INVALID_ACTION,
    }),
    path: z.string().optional(),
    appName: z.string().optional(),
    deviceId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === AGENT_ACTION.OPEN_FOLDER && !data.path) return false;
      if (data.action === AGENT_ACTION.LAUNCH_APP && !data.appName) return false;
      return true;
    },
    {
      message: VALIDATION_MESSAGES.AGENT.MISSING_TARGET,
      path: ['action'],
    },
  );

export type AgentLaunchInput = z.infer<typeof agentLaunchSchema>;
