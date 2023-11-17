import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ApproveReportDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  reportId: number;
}
