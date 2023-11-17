import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('🏠AuthController (e2e) | Sign Up', () => {
  let app: INestApplication;
  const path: string = '/auth/signup';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it(`${path} (GET) | Sign Up `, () => {
    const email = 'user1@gmail.com';

    return request(app.getHttpServer())
      .post(path)
      .send({ email, password: 'myPassword' })
      .expect(201)
      .then((res) => {
        const { id, email: responseEmail } = res.body;
        expect(id).toBeDefined();
        expect(responseEmail).toEqual(email);
      });
  });
});
