import { z } from 'zod';

import { NOTE_TYPE } from '@repo/constants';

import { paginationSchema } from './pagination.schema';

export const NoteTypeSchema = z.nativeEnum(NOTE_TYPE);

export const CreateNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000).optional(),
  type: NoteTypeSchema,
  category: z.string().max(50).optional(),
  sortOrder: z.number().int().min(0).optional(),
  resourceId: z.string().uuid().nullable().optional(),
});

export const CreateCommandSchema = CreateNoteSchema.extend({
  content: z.string().min(1, 'Nội dung lệnh là bắt buộc').max(50000),
});

export const UpdateNoteSchema = CreateNoteSchema.partial();

export const NoteQuerySchema = paginationSchema.extend({
  type: z.nativeEnum(NOTE_TYPE).optional(),
  resourceId: z.union([z.string().uuid(), z.literal('none')]).optional(),
});

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type CreateCommandInput = z.infer<typeof CreateCommandSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
export type NoteType = z.infer<typeof NoteTypeSchema>;
export type NoteQuery = z.infer<typeof NoteQuerySchema>;
