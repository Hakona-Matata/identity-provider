import { Body, Controller, Post, Session } from '@nestjs/common';
import { CreateUserDto, PublicUserDto } from '../user/dtos';
import { Serialize } from 'src/shared/decorators';
import { AuthService } from './auth.service';

@Controller('auth')
@Serialize(PublicUserDto)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() data: CreateUserDto) {
    return await this.authService.signUp(data);
  }

  @Post('/login')
  async logIn(@Body() data: CreateUserDto, @Session() session: any) {
    const user = await this.authService.logIn(data);

    session.userId = user.id;

    return user;
  }
}
