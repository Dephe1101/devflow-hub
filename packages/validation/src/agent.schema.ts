import { z } from 'zod';

export const agentLaunchSchema = z
  .object({
    action: z.enum(['open_folder', 'launch_app'], {
      required_error: 'Yêu cầu phải có Hành động (Action)',
      invalid_type_error: 'Hành động phải là open_folder hoặc launch_app',
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
      message: 'Yêu cầu Path cho open_folder, hoặc appName cho launch_app',
      path: ['action'],
    },
  );

export type AgentLaunchInput = z.infer<typeof agentLaunchSchema>;
