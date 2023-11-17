import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserService } from '../../../user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../../../user/dtos';
import { AuthService } from '../../auth.service';
import { User } from '../../../user/user.entity';

describe('🏠AuthService | Log In', () => {
  let service: AuthService;
  let fakeUserService: Partial<UserService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUserService = {
      createOne: (data: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 1000),
          isDeleted: false,
          isAdmin: true,
          ...data,
        } as User;
        users.push(user);
        return Promise.resolve(user as User);
      },
      findOne: (query: Partial<User>) => {
        const [user] = users.filter((user) => user.email === query.email);
        return Promise.resolve(user as User);
      },
      findByEmail: (email: string) => {
        const [user] = users.filter((user) => user.email === email);
        if (!user) return Promise.reject(new NotFoundException());
        return Promise.resolve(user as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('It should be defined', () => {
    expect(service).toBeDefined();
  });

  it('It should return the user if the given email and password are correct', async () => {
    await service.signUp({
      email: 'user1@gmail.com',
      password: 'myPassword',
    });

    const user = await service.logIn({
      email: 'user1@gmail.com',
      password: 'myPassword',
    });

    expect(user).toBeDefined;
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('password');
  });

  it('It should throw error if the email is not registered', async () => {
    await expect(
      service.logIn({ email: 'user1@gmail.com', password: 'myPassword' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('It should throw error if the password is not correct', async () => {
    await service.signUp({
      email: 'user1@gmail.com',
      password: 'myPassword',
    });

    await expect(
      service.logIn({ email: 'user1@gmail.com', password: 'notMyPassword' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
