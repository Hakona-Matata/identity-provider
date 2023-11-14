import { UseInterceptors } from '@nestjs/common';
import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor';

export function Serialize(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
