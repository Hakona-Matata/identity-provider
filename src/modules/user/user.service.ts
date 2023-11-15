import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, GetAllUsersDto } from './dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOne(data: CreateUserDto) {
    const user = this.userRepository.create(data);

    const isUserCreated = await this.userRepository.save(user);

    if (!isUserCreated)
      throw new InternalServerErrorException(
        'The user creation process failed!',
      );

    return isUserCreated;
  }

  async updateOne(userId: number, payload: Partial<User>) {
    const user = await this.findById(userId);

    const isUserUpdated = await this.userRepository.save({
      ...user,
      ...payload,
    });

    if (!isUserUpdated)
      throw new InternalServerErrorException('The user update process failed!');

    return isUserUpdated;
  }

  async deleteOne(userId: number) {
    const user = await this.findById(userId);

    const isUserUpdated = await this.userRepository.save({
      ...user,
      isDeleted: true,
    });

    if (!isUserUpdated)
      throw new InternalServerErrorException(
        'The user deletion process failed!',
      );

    return 'The user is deleted successfully!';
  }

  async findOne(query: Partial<User>): Promise<User> {
    return await this.userRepository.findOneBy(query);
  }

  async findByEmail(email: string): Promise<User> {
    const isUserFound = await this.findOne({
      email,
      isDeleted: false,
    });

    if (!isUserFound) throw new NotFoundException('The user is not found!');

    return isUserFound;
  }

  async findById(userId: number): Promise<User> {
    if (!userId) return null;

    const isUserFound = await this.findOne({
      id: userId,
      isDeleted: false,
    });

    if (!isUserFound) throw new NotFoundException('The user is not found!');

    return isUserFound;
  }

  async findAll({ pageNumber, pageSize }: GetAllUsersDto): Promise<User[]> {
    pageNumber = pageNumber || 1;
    pageSize = pageSize || 5;

    const queryBuilder = await this.userRepository.createQueryBuilder('user');

    const areUsersFound = await queryBuilder
      .where('user.isDeleted = :isDeleted', { isDeleted: false })
      .take(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .getMany();

    if (areUsersFound.length == 0)
      throw new NotFoundException('The users are not found!');

    return areUsersFound;
  }
}
