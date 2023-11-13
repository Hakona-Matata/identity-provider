import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateMessageDto {
  @IsString({ message: `The 'name' field must be a string.` })
  @IsNotEmpty({ message: `The 'name' field cannot be empty.` })
  name: string;
}
