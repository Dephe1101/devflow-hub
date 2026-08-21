import { z } from 'zod';

export const resourceTypeEnum = z.enum(['URL', 'LOCAL_PATH', 'APP_URI', 'COMMAND']);

export const createResourceSchema = z.object({
  type: resourceTypeEnum,
  value: z.string().min(1, 'Giá trị không được để trống'),
  displayName: z.string().max(100).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateResourceSchema = createResourceSchema.partial();

export const reorderResourceSchema = z.object({
  resourceIds: z.array(z.string().uuid()),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ReorderResourceInput = z.infer<typeof reorderResourceSchema>;
