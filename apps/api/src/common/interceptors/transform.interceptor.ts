import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // If data is already in the normalized Response structure, add timestamp and return
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data &&
          Object.keys(data).length <= 3
        ) {
          return {
            ...(data as Record<string, unknown>),
            timestamp:
              (data as { timestamp?: string }).timestamp ??
              new Date().toISOString(),
          } as Response<T>;
        }

        // Unwrap { data: ... } if controllers still return it
        const actualData =
          data &&
          typeof data === 'object' &&
          'data' in data &&
          Object.keys(data).length === 1
            ? (data as { data: T }).data
            : (data as T);

        return {
          success: true,
          data: actualData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
