import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<S, T> {
  message: S;
  data: T;
}

@Injectable()
export class ResponseInterceptor<S, T>
  implements NestInterceptor<T, Response<S, T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<S, T>> {
    const status = context.switchToHttp().getResponse().statusCode;
    return next
      .handle()
      .pipe(
        map(({ message, data }) => ({ status, success: true, message, data })),
      );
  }
}
