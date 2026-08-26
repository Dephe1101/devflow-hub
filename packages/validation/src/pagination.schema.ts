import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20).default(20),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
