import { AuthController } from '../../auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from 'src/modules/user/dtos';
import { User } from 'src/modules/user/user.entity';
import { AuthService } from '../../auth.service';

describe('🏠AuthController | Log In', () => {
  let controller: AuthController;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeAuthService = {
      logIn: (data: CreateUserDto) =>
        Promise.resolve({
          id: Math.floor(Math.random() * 10),
          ...data,
        } as User),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: fakeAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('It should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('It should return the created user after successful login process', async () => {
    const user = await controller.logIn(
      {
        email: 'user1@gmail.com',
        password: 'myPassword',
      },
      {},
    );

    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
  });

  it('It should return the created user and update session object after successful login process', async () => {
    const session = { userId: null };

    const user = await controller.logIn(
      {
        email: 'user1@gmail.com',
        password: 'myPassword',
      },
      session,
    );

    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(session.userId).toEqual(user.id);
    expect(session).toHaveProperty('userId');
  });
});
