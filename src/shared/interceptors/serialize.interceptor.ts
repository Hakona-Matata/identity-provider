import { Observable, map } from 'rxjs';
import { ClassConstructor } from '../interfaces';
import { plainToInstance } from 'class-transformer';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true, // only return fields with @Expose !!!!
        });
      }),
    );
  }
}
