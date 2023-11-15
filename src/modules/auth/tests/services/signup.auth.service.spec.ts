import { UserService } from '../../../user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { CreateUserDto } from '../../../user/dtos';
import { AuthService } from '../../auth.service';
import { User } from '../../../user/user.entity';

describe('🏠AuthService | Sign Up', () => {
  let service: AuthService;
  let fakeUserService: Partial<UserService>;

  beforeEach(async () => {
    fakeUserService = {
      createOne: (data: CreateUserDto) =>
        Promise.resolve({ id: 1, ...data } as User),
      findOne: (query: Partial<User>) => Promise.resolve(null as User),
      findByEmail: (email: string) => Promise.resolve({ id: 1, email } as User),
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

  it('It should create a new user with a salted and hashed password', async () => {
    const user = await service.signUp({
      email: 'user1@gmail.com',
      password: 'myPassword',
    });

    const [salt, hash] = user.password.split('.');

    expect(user.password).not.toEqual('myPassword');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUserService.findOne = () => {
      return Promise.resolve({
        id: 1,
        email: 'user1@gmail.com',
        password: 'myPassword',
      } as User);
    };

    await expect(
      service.signUp({
        email: 'user1@gmail.com',
        password: 'myPassword',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
