import type { User } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

export interface NestRequest extends FastifyRequest {
  user: User;
}
