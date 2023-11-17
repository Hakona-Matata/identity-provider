import { Expose, Transform } from 'class-transformer';

export class ReportDto {
  @Expose()
  id: number;

  @Expose()
  price: number;

  @Expose()
  manufacture: string;

  @Expose()
  model: string;

  @Expose()
  creationYear: number;

  @Expose()
  lng: number;

  @Expose()
  lat: number;

  @Expose()
  milage: number;

  @Expose()
  isApproved: boolean;

  @Transform(({ obj }) => (obj.user ? obj.user.id : undefined))
  @Expose()
  userId: number;
}
