import { z } from 'zod';

import { AGENT_ACTION } from '@repo/constants';

export const agentLaunchSchema = z
  .object({
    action: z.nativeEnum(AGENT_ACTION, {
      required_error: 'Yêu cầu phải có Hành động (Action)',
      invalid_type_error: 'Hành động phải là open_folder hoặc launch_app',
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
      message: 'Yêu cầu Path cho open_folder, hoặc appName cho launch_app',
      path: ['action'],
    },
  );

export type AgentLaunchInput = z.infer<typeof agentLaunchSchema>;
