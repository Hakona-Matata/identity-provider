import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { User } from 'src/modules/user/user.entity';

export class GetEstimateDto {
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  manufacture: string;

  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  model: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1990)
  @Max(2024)
  @IsNotEmpty()
  creationYear: number;

  @Type(() => Number)
  @IsLongitude()
  @IsNotEmpty()
  lng: number;

  @Type(() => Number)
  @IsLatitude()
  @IsNotEmpty()
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000_000)
  @IsNotEmpty()
  milage: number;

  @Type(() => User)
  user: User;
}
