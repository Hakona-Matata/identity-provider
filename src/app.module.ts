import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { MessagesModule } from './modules/message/messages.module';
import { ReportModule } from './modules/report/report.module';
import { AuthModule } from './modules/auth/auth.module';
import { Report } from './modules/report/report.entity';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/user.entity';
import { AppController } from './app.controller';
const cookieSession = require('cookie-session');
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CurrentUserInterceptor } from './modules/user/interceptors';
import { CurrentUserMiddleware } from './shared/middlewares';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    // for multiple environment part!
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'sqlite',
          database: config.get<string>('DB_NAME'),
          entities: [User, Report],
          synchronize: true,
        };
      },
    }),
    MessagesModule,
    UserModule,
    ReportModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // this is how we configure a global pipe!
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // only accept inputs that we are expecting!
        transform: true,
      }),
    },

    // For making hte @CurrentUser globally!
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get('COOKIE_KEY')],
        }),
      )
      .forRoutes('*');

    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
