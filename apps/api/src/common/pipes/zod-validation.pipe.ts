import { ERROR_MESSAGES } from '@repo/constants';
import { BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';

import type { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import type { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return value;
    }

    try {
      const parsedValue = this.schema.parse(value) as unknown;
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.VALIDATION.INVALID_DATA,
          details: error.errors,
        });
      }
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_DATA);
    }
  }
}
