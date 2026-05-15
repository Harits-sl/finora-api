import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types/response.type';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (
          data !== null &&
          typeof data === 'object' &&
          'success' in data &&
          'message' in data
        ) {
          return data as ApiResponse<T>;
        }
        return { success: true, message: 'Success', data: data as T };
      }),
    );
  }
}
