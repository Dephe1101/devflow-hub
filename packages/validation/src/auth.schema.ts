import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@repo/constants';

export const registerSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID),
  name: z
    .string()
    .min(2, VALIDATION_MESSAGES.AUTH.NAME_MIN)
    .max(50, VALIDATION_MESSAGES.AUTH.NAME_MAX),
  password: z.string().min(6, VALIDATION_MESSAGES.AUTH.PASSWORD_MIN),
});

export const loginSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID),
  password: z.string().min(1, VALIDATION_MESSAGES.AUTH.PASSWORD_REQUIRED),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
