import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      const resp = exception.getResponse();
      if (typeof resp === 'string') {
        message = resp;
      } else {
        const respObj = resp as Record<string, unknown>;
        message =
          typeof respObj.message === 'string' ? respObj.message : message;
        errorCode =
          typeof respObj.code === 'string'
            ? respObj.code
            : typeof respObj.error === 'string'
              ? respObj.error
              : errorCode;
        details = respObj.details;
      }
    } else {
      message =
        exception instanceof Error ? exception.message : String(exception);
    }

    const body = {
      error: {
        code: errorCode,
        message,
        statusCode: status,
        details,
        timestamp: new Date().toISOString(),
      },
    };

    if (status >= 500) {
      this.logger.error(
        `[${String(status)}] ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).send(body);
  }
}
