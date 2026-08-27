import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@repo/constants';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.WORKSPACE.NAME_REQUIRED).max(100),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, VALIDATION_MESSAGES.WORKSPACE.INVALID_COLOR)
    .optional(),
  icon: z.string().optional(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial().extend({
  isPinned: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
