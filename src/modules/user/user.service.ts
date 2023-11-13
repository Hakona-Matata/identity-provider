import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto, GetAllUsersDto, UpdateUserDto } from './dtos';
import { userRepository } from './user.repository';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private userRepository: userRepository) {}

  async signUp(data: CreateUserDto): Promise<User> {
    const isAlreadyFound = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (isAlreadyFound)
      throw new ForbiddenException('Email or password is incorrect!');

    return await this.userRepository.createOne(data);
  }

  async updateUser(userId: number, payload: UpdateUserDto) {
    return await this.userRepository.updateOne(userId, payload);
  }

  async deleteUser(userId: number): Promise<string> {
    return await this.userRepository.deleteOne(userId);
  }

  async getUser(id: number): Promise<User> {
    return await this.userRepository.findById(id);
  }

  async getAllUsers(query: GetAllUsersDto): Promise<User[]> {
    return await this.userRepository.findAll(query);
  }
}
