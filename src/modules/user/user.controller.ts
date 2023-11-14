import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Serialize } from 'src/shared/decorators';
import { PublicUserDto, UpdateUserDto } from './dtos';

@Controller('users')
@Serialize(PublicUserDto)
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('/:userId')
  async updateUser(@Param('userId') userId, @Body() payload: UpdateUserDto) {
    return await this.userService.updateOne(+userId, payload);
  }

  @Delete('/:userId')
  async deleteUser(@Param('userId') userId: string) {
    return await this.userService.deleteOne(+userId);
  }

  @Get('/:userId')
  async getUser(@Param('userId') userId: string) {
    return await this.userService.findById(+userId);
  }

  @Get()
  async getAllUsers(
    @Query('pageSize') pageSize: number,
    @Query('pageNumber') pageNumber: number,
  ) {
    return await this.userService.findAll({ pageSize, pageNumber });
  }
}
