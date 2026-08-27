import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@repo/constants';
import { RESOURCE_TYPE } from '@repo/constants';

export const resourceTypeEnum = z.nativeEnum(RESOURCE_TYPE);

export const createResourceSchema = z.object({
  type: resourceTypeEnum,
  value: z
    .string()
    .min(1, VALIDATION_MESSAGES.RESOURCE.VALUE_REQUIRED)
    .refine((val) => val.trim().toLowerCase().indexOf('javascript:') !== 0, {
      message: VALIDATION_MESSAGES.RESOURCE.INVALID_URL,
    }),
  displayName: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateResourceSchema = createResourceSchema.partial();

export const reorderResourceSchema = z.object({
  resourceIds: z.array(z.string().uuid()),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ReorderResourceInput = z.infer<typeof reorderResourceSchema>;
