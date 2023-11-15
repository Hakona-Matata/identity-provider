import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dtos';
import { randomBytes, scrypt } from 'crypto';
import { User } from '../user/user.entity';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signUp(data: CreateUserDto): Promise<User> {
    const isAlreadyFound = await this.userService.findOne({
      email: data.email,
      isDeleted: false,
    });

    if (isAlreadyFound)
      throw new ForbiddenException('Email or password is incorrect!');

    const salt = randomBytes(8).toString('hex');

    const hashBuffer = (await scryptAsync(data.password, salt, 32)) as Buffer;

    const hash = hashBuffer.toString('hex');

    data.password = salt + '.' + hash;

    return await this.userService.createOne(data);
  }

  async logIn(data: CreateUserDto) {
    const isUserFound = await this.userService.findByEmail(data.email);

    const [salt, storedHash] = isUserFound.password.split('.');

    const hashBuffer = (await scryptAsync(data.password, salt, 32)) as Buffer;

    const hash = hashBuffer.toString('hex');

    if (hash !== storedHash)
      throw new ForbiddenException('Email or password is incorrect!');

    return isUserFound;
  }
}
