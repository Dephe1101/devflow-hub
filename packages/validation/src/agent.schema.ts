import { z } from 'zod';

export const agentLaunchSchema = z
  .object({
    action: z.enum(['open_folder', 'launch_app'], {
      required_error: 'Action is required',
      invalid_type_error: 'Action must be open_folder or launch_app',
    }),
    path: z.string().optional(),
    appName: z.string().optional(),
    deviceId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === 'open_folder' && !data.path) return false;
      if (data.action === 'launch_app' && !data.appName) return false;
      return true;
    },
    {
      message: 'Path is required for open_folder, appName is required for launch_app',
      path: ['action'],
    },
  );

export type AgentLaunchInput = z.infer<typeof agentLaunchSchema>;
