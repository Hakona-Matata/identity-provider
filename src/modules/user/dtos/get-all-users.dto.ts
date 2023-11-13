import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetAllUsersDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageNumber: number;
}
