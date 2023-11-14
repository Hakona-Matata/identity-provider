import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { User } from './modules/user/user.entity';
import { Report } from './modules/report/report.entity';
import { UserModule } from './modules/user/user.module';
import { ReportModule } from './modules/report/report.module';
import { MessagesModule } from './modules/message/messages.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Report],
      synchronize: true,
    }),
    MessagesModule,
    UserModule,
    ReportModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
