import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, PublicUserDto } from '../user/dtos';
import { Serialize } from './../../shared/decorators';
import { CurrentUser } from '../user/decorators';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { AuthGuard } from './guards';

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

  @Get('/whoami')
  @UseGuards(AuthGuard)
  async whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('/logout')
  async logOut(@Session() session: any) {
    if (!session.userId) throw new BadRequestException('Already logged out!');
    session.userId = null;
    return 'Logged out successfully!';
  }
}
