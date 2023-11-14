import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto, GetAllUsersDto, UpdateUserDto } from './dtos';
import { UserService } from './user.service';
import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor';

@Controller('auth')
@UseInterceptors(SerializeInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/sign-up')
  async signUp(@Body() data: CreateUserDto) {
    return await this.userService.signUp(data);
  }

  @Patch('/:userId')
  async updateUser(@Param('userId') userId, @Body() payload: UpdateUserDto) {
    return await this.userService.updateUser(+userId, payload);
  }

  @Delete('/:userId')
  async deleteUser(@Param('userId') userId: string) {
    return await this.userService.deleteUser(+userId);
  }

  @Get('/:userId')
  async getUser(@Param('userId') userId: string) {
    return await this.userService.getUser(+userId);
  }

  @Get()
  async getAllUsers(
    @Query('pageSize') pageSize: number,
    @Query('pageNumber') pageNumber: number,
  ) {
    return await this.userService.getAllUsers({ pageSize, pageNumber });
  }
}
