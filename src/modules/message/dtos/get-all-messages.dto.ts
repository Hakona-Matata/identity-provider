import { IsNumber, IsOptional } from 'class-validator';

export class GetAllMessagesDto {
  @IsNumber()
  @IsOptional()
  pageNumber: number;

  @IsNumber()
  @IsOptional()
  pageSize: number;
}
