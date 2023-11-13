import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // only accept inputs that we are expecting!
      transform: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();
