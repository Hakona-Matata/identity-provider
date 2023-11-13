import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @Type(() => String)
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  password: string;
}
