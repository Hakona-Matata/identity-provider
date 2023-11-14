import { UseInterceptors } from '@nestjs/common';
import { ClassConstructor } from '../interfaces';
import { SerializeInterceptor } from '../interceptors';

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
