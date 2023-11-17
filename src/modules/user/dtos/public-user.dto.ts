import { Expose } from 'class-transformer';

export class PublicUserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  isAdmin: boolean;
}
